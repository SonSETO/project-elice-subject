import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Images } from 'src/images/entities/image.entity';

import { CategoryName } from 'src/common/utils/enum/product-enum';
import { IProductRepository } from './interface/product.repository.interface';
import { CustomRepository } from 'src/common/custom-repository.decorator';
import { ImagesRepository } from 'src/images/images.repository';

@CustomRepository(Product)
export class ProductRepository
  extends Repository<Product>
  implements IProductRepository
{
  async createProduct(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    const insertResult = await this.createQueryBuilder()
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

  async getProductById(id: number): Promise<Product | null> {
    const product = await this.findOne({
      where: { id },
      relations: ['images'],
    });

    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.createQueryBuilder()
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
    await this.remove(product);
  }

  async getAllProducts(
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; meta: any }> {
    const queryBuilder = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')

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
    const queryBuilder = this.createQueryBuilder('product')
      .where('product.category = :category', { category })
      .leftJoinAndSelect('product.images', 'images')

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
