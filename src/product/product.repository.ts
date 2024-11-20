import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Images } from 'src/images/entities/image.entity';
import { ProductUserLike } from './entities/product-user-like.entity';
import { CategoryName } from 'src/common/utils/enum/product-enum';
import { IProductRepository } from './interface/product.repository.interface';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductUserLike)
    private readonly productUserLikeRepository: Repository<ProductUserLike>,
    @InjectRepository(Images)
    private readonly imageRepository: Repository<Images>,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    const insertResult = await this.productRepository
      .createQueryBuilder()
      .insert()
      .into(Product)
      .values({
        ...createProductDto,
        user: { id: userId },
      })
      .execute();

    const productId = insertResult.identifiers[0].id;

    return this.getProductById(productId) as Promise<Product>;
  }

  async saveImages(images: Images[]): Promise<void> {
    await this.imageRepository
      .createQueryBuilder()
      .insert()
      .into(Images)
      .values(images)
      .execute();
  }

  // async createProduct(createProductDto: CreateProductDto): Promise<Product> {
  //   const product = this.productRepository.create(createProductDto);
  //   return this.productRepository.save(product);
  // }

  // async saveImages(images: Images[]): Promise<void> {
  //   await this.imageRepository.save(images);
  // }

  async getProductById(id: number): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images', 'likedUsers'],
    });

    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    images: Images[],
  ): Promise<Product> {
    if (images.length > 0) {
      await this.imageRepository
        .createQueryBuilder()
        .delete()
        .from(Images)
        .where('productId = :id', { id })
        .execute();

      await this.imageRepository
        .createQueryBuilder()
        .insert()
        .into(Images)
        .values(images)
        .execute();
    }

    await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set(updateProductDto)
      .where('id = :id', { id })
      .execute();

    return this.getProductById(id) as Promise<Product>;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.getProductById(id);
    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }
    await this.productRepository.remove(product);
  }

  async toggleLike(
    productId: number,
    userId: number,
    isLike: boolean,
  ): Promise<{ likeCountChange: number }> {
    const likeRecord = await this.productUserLikeRepository.findOne({
      where: { product: { id: productId }, user: { id: userId } },
    });

    if (likeRecord && likeRecord.isLike === isLike) {
      await this.productUserLikeRepository.remove(likeRecord);
      return { likeCountChange: -1 };
    }

    if (likeRecord) {
      likeRecord.isLike = isLike;
      await this.productUserLikeRepository.save(likeRecord);
      return { likeCountChange: isLike ? 1 : -1 };
    }

    await this.productUserLikeRepository.save({
      product: { id: productId },
      user: { id: userId },
      isLike,
    });
    return { likeCountChange: 1 };
  }

  async getLikedProductsByUser(userId: number): Promise<Product[]> {
    const likedProducts = await this.productUserLikeRepository
      .createQueryBuilder('pul')
      .leftJoinAndSelect('pul.product', 'product')
      .where('pul.userId = :userId', { userId })
      .andWhere('pul.isLike = :isLike', { isLike: true })
      .getMany();

    return likedProducts.map((like) => like.product);
  }

  async getAllProducts(
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; meta: any }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.likeCount', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getProductsByCategory(
    category: CategoryName,
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; meta: any }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.category = :category', { category })
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.likeCount', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
