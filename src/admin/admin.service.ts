import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { CustomLoggerService } from 'src/common/logger.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly logger: CustomLoggerService,
  ) {}

  async getNewUsersCount(): Promise<number> {
    this.logger.log('신규 가입자 수 조회 요청');
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await this.userRepository.count({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    this.logger.log(`신규 가입자 수: ${count}`);
    return count;
  }

  async getTodayOrdersCount(): Promise<number> {
    this.logger.log('오늘(00-24)의 주문 갯수 조회 요청');
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await this.orderRepository.count({
      where: {
        orderDate: Between(startOfDay, endOfDay),
      },
    });

    this.logger.log(`오늘(00-24)의 주문 갯수: ${count}`);
    return count;
  }

  async getTopLikedProducts(limit: number): Promise<Product[]> {
    this.logger.log(`가장 많이 좋아요가 눌린 상품 조회 요청 (limit: ${limit})`);
    const products = await this.productRepository.find({
      order: {
        likeCount: 'DESC',
      },
      take: limit,
    });

    this.logger.log(
      `가장 많이 좋아요가 눌린 상품: ${products
        .map((product) => `${product.title} (좋아요: ${product.likeCount})`)
        .join(', ')}`,
    );
    return products;
  }

  async getTodayRevenue(): Promise<number> {
    this.logger.log('금일(00-24) 매출 합계 조회 요청');
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .where('order.orderDate BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere('order.orderStatus = :status', { status: '배송 중' })
      .getRawOne();

    const revenue = result.total || 0;
    this.logger.log(`금일 매출 합계: ${revenue}`);
    return revenue;
  }
}
