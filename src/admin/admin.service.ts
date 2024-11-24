import { Inject, Injectable } from '@nestjs/common';

import { Between, In } from 'typeorm';

import { CustomLoggerService } from 'src/common/logger.service';
import { UserRepository } from 'src/users/users.repository';
import { OrderRepository } from 'src/order/order.repository';
import { ProductRepository } from 'src/product/product.repository';

@Injectable()
export class AdminService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(OrderRepository)
    private readonly orderRepository: OrderRepository,
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,

    private readonly logger: CustomLoggerService,
  ) {}

  async getTodayNewUsersCount(): Promise<number> {
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

  async getTodayBestProducts(
    limit: number,
  ): Promise<
    { id: number; title: string; totalQuantity: number; imageUrl: string }[]
  > {
    this.logger.log(`오늘의 베스트 상품 조회 요청 (limit: ${limit})`);

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const bestSellingProducts = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'orderItem')
      .leftJoin('orderItem.product', 'product')
      .leftJoin('product.images', 'image')
      .select('orderItem.productId', 'productId')
      .addSelect('SUM(orderItem.quantity)', 'totalQuantity')
      .addSelect('MIN(image.url)', 'imageUrl')
      .where('order.orderDate BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .groupBy('orderItem.productId')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();

    const productIds = bestSellingProducts.map((item) => item.productId);

    if (productIds.length === 0) {
      this.logger.log('오늘 동안 주문된 상품이 없습니다.');
      return [];
    }

    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['images', 'orderItems'],
    });

    const results = bestSellingProducts.map((productStats) => {
      const product = products.find(
        (item) => item.id === productStats.productId,
      );
      const imageUrl = product?.images?.[0]?.url || '이미지 없음';

      return {
        id: product?.id || 0,
        title: product?.title || '알 수 없는 상품',
        totalQuantity: parseInt(productStats.totalQuantity, 10),
        imageUrl,
      };
    });

    this.logger.log(
      `오늘의 베스트 상품: ${results
        .map(
          (result) =>
            `${result.title} (주문량: ${result.totalQuantity}, 이미지: ${result.imageUrl})`,
        )
        .join(', ')}`,
    );

    return results;
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
