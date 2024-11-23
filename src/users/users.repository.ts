import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { IUserRepository } from './interface/user.repository.interface';
import { IOrderRepository } from 'src/order/interface/order-repository.interface';
import { CustomRepository } from 'src/common/custom-repository.decorator';

@CustomRepository(User)
export class UserRepository
  extends Repository<User>
  implements IUserRepository
{
  async findAllUsers(): Promise<User[]> {
    return this.createQueryBuilder('user').getMany();
  }

  async findById(id: number): Promise<User> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'orders')
      .leftJoinAndSelect('orders.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('user.id = :id', { id })
      .getOne();
  }

  // async findProductsByUserId(userId: number): Promise<Product[]> {
  //   return this.productRepository
  //     .createQueryBuilder('product')
  //     .leftJoinAndSelect('product.user', 'user')
  //     .where('user.id = :userId', { userId })
  //     .getMany();
  // }
}
