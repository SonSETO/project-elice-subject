import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Images } from 'src/images/entities/image.entity';
import { IProductService } from './interface/product.interface';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductUserLike } from './entities/product-user-like.entity';
import { CategoryName } from 'src/common/utils/enum/product-enum';
import { IProductRepository } from './interface/product.repository.interface';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/users/interface/user.repository.interface';
import { CustomLoggerService } from 'src/common/logger.service';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {}

  // 상품 생성
  async createProduct(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    userId: number,
  ): Promise<Product> {
    this.logger.log('상품 생성 요청 시작', { userId, createProductDto });

    if (!files || files.length === 0) {
      this.logger.warn('이미지 파일이 제공되지 않음');
      throw new BadRequestException('이미지 파일은 최소 1개 이상 필요합니다.');
    }

    const product = await this.productRepository.createProduct(
      createProductDto,
      userId,
    );
    // const uploadPath = this.configService.get<string>('UPLOAD_PATH')
    const images = files.map((file) => {
      const image = new Images();
      image.url = `/uploads/products/${file.filename}`;
      image.product = product;
      return image;
    });

    await this.productRepository.saveImages(images);

    this.logger.log('상품 생성 완료', { productId: product.id, userId });

    return this.productRepository.getProductById(product.id);
  }

  // 상품 가져오기
  async getProduct(id: number): Promise<Product> {
    this.logger.log(`상품 조회 요청: 상품 ID ${id}`);

    const product = await this.productRepository.getProductById(id);
    if (!product) {
      this.logger.warn(`상품 조회 실패: 상품 ID ${id}`);
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    this.logger.log(`상품 조회 성공: 상품 ID ${id}`, product);
    return product;
  }

  // 상품 업데이트
  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ): Promise<Product> {
    this.logger.log(`상품 업데이트 요청: 상품 ID ${id}`, updateProductDto);

    const images = files.map((file) => {
      const image = new Images();
      image.url = `/uploads/products/${file.filename}`;
      image.product = { id } as Product;
      return image;
    });

    const updatedProduct = await this.productRepository.updateProduct(
      id,
      updateProductDto,
      images,
    );

    this.logger.log(`상품 업데이트 성공: 상품 ID ${id}`, updatedProduct);
    return updatedProduct;
  }

  // 상품 삭제
  async deleteProduct(id: number): Promise<void> {
    this.logger.log(`상품 삭제 요청: 상품 ID ${id}`);

    await this.productRepository.deleteProduct(id);

    this.logger.log(`상품 삭제 완료: 상품 ID ${id}`);
  }

  //상품 좋아요 버튼(없앨까 고민중)
  async toggleProductLike(
    productId: number,
    userId: number,
    isLike: boolean,
  ): Promise<{ message: string }> {
    this.logger.log(
      `상품 좋아요 상태 변경 요청: 상품 ID ${productId}, 사용자 ID ${userId}, 상태 ${isLike}`,
    );

    const { likeCountChange } = await this.productRepository.toggleLike(
      productId,
      userId,
      isLike,
    );

    this.logger.log(
      `상품 좋아요 상태 변경 완료: 상품 ID ${productId}, 사용자 ID ${userId}, 변경 수 ${likeCountChange}`,
    );

    return { message: `좋아요 상태가 변경되었습니다: ${likeCountChange}` };
  }

  // 사용자가 좋아요한 상품 조회
  async getLikedProducts(userId: number): Promise<Product[]> {
    this.logger.log(`사용자가 좋아요한 상품 조회 요청: 사용자 ID ${userId}`);

    const likedProducts =
      await this.productRepository.getLikedProductsByUser(userId);

    this.logger.log(
      `사용자가 좋아요한 상품 조회 완료: 사용자 ID ${userId}, 상품 수 ${likedProducts.length}`,
    );

    return likedProducts;
  }

  // 모든 상품 가져오기
  async getAllProducts(
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; meta: any }> {
    this.logger.log(`모든 상품 조회 요청: 페이지 ${page}, 제한 ${limit}`);

    const result = await this.productRepository.getAllProducts(page, limit);

    this.logger.log(
      `모든 상품 조회 완료: 페이지 ${page}, 총 상품 수 ${result.meta.total}`,
    );

    return result;
  }

  // 카테고리에 속한 상품 가져오기
  async getProductsByCategory(
    category: CategoryName,
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; meta: any }> {
    this.logger.log(
      `카테고리 상품 조회 요청: 카테고리 ${category}, 페이지 ${page}, 제한 ${limit}`,
    );

    const result = await this.productRepository.getProductsByCategory(
      category,
      page,
      limit,
    );

    this.logger.log(
      `카테고리 상품 조회 완료: 카테고리 ${category}, 페이지 ${page}, 총 상품 수 ${result.meta.total}`,
    );

    return result;
  }
}
