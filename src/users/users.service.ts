import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserService } from './interface/user.interface';
import { User } from './entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { IUserRepository } from './interface/user.repository.interface';
import { CustomLoggerService } from 'src/common/logger.service';
import { UserRepository } from './users.repository';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async findAllUsers(): Promise<User[]> {
    this.logger.log(`모든 사용자 조회 요청`);
    const users = await this.userRepository.findAllUsers();
    this.logger.log(`모든 사용자 조회 완료: 총 ${users.length}명`);
    return users;
  }

  async findById(id: number): Promise<User> {
    this.logger.log(`사용자 조회 요청: 사용자 ID ${id}`);
    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn(`사용자 찾을 수 없음: 사용자 ID ${id}`);
      throw new NotFoundException(`사용자 찾을 수 없음 : ${id}`);
    }
    return user;
  }

  // async findUserOrders(userId: number): Promise<Order[]> {
  //   this.logger.log(`사용자 주문 조회 요청: 사용자 ${userId}`);
  //   const orders = await this.userRepository.findOrdersByUserId(userId);
  //   if (!orders.length) {
  //     this.logger.warn(`사용자 주문 내역 없음: 사용자 ${userId}`);
  //     throw new NotFoundException('이 사용자에 대한 주문을 찾을 수 없습니다');
  //   }
  //   return orders;
  // }

  // async findUserProducts(userId: number): Promise<Product[]> {
  //   this.logger.log(`사용자 제품 조회 요청: 사용자 ${userId}`);
  //   const products = await this.userRepository.findProductsByUserId(userId);
  //   if (!products.length) {
  //     this.logger.warn(`사용자 제품 없음: 사용자 ${userId}`);
  //     throw new NotFoundException('이 사용자에 대한 제품을 찾을 수 없습니다');
  //   }
  //   return products;
  // }
}
