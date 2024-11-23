import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { Order } from './entities/order.entity';
import { IOrderService } from './interface/order-service.interface';
import { IOrderRepository } from './interface/order-repository.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { IProductRepository } from 'src/product/interface/product.repository.interface';
import { IAddressRepository } from 'src/address/interface/address.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/address/entities/address.entity';
import { Repository } from 'typeorm';
import { CustomLoggerService } from 'src/common/logger.service';
import { OrderRepository } from './order.repository';
import { OrderStatus } from 'src/common/utils/enum/order.status-enum';
import { ProductRepository } from 'src/product/product.repository';
import { AddressRepository } from 'src/address/address.repository';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    @Inject(OrderRepository)
    private readonly orderRepository: OrderRepository,
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
    @Inject(AddressRepository)
    private readonly addressRepository: AddressRepository,

    private readonly logger: CustomLoggerService,
  ) {}

  //주문 하기
  async createOrder(orderDto: CreateOrderDto, userId: number) {
    this.logger.log(`주문 생성 요청: 사용자 ${userId}`);
    const { addressId, items } = orderDto;

    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) {
      this.logger.warn(`유효하지 않은 배송지 ID: ${addressId}`);
      throw new NotFoundException(
        `해당 유저의 배송지 ID ${addressId}를 찾을 수 없습니다.`,
      );
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await this.productRepository.getProductById(
        item.productId,
      );
      if (!product) {
        this.logger.warn(`유효하지 않은 상품 ID: ${item.productId}`);
        throw new NotFoundException(
          `상품 ID ${item.productId}를 찾을 수 없습니다.`,
        );
      }

      const itemTotalPrice = product.price * item.quantity;
      totalPrice += itemTotalPrice;

      orderItems.push({
        product: { id: product.id },
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotalPrice,
      });
    }

    const createdOrder = await this.orderRepository.createOrder(
      userId,
      addressId,
      orderItems,
      totalPrice,
    );

    const savedOrder = await this.orderRepository.findOne({
      where: { id: createdOrder.id },
      relations: ['items', 'items.product', 'address'],
    });

    if (!savedOrder) {
      this.logger.error(
        `주문 ID ${createdOrder.id}를 저장 후 찾을 수 없습니다.`,
      );
      throw new NotFoundException(
        `주문 ID ${createdOrder.id}를 찾을 수 없습니다.`,
      );
    }

    this.logger.log(`주문 생성 완료: 주문 ID ${savedOrder.id}`);
    return savedOrder;
  }

  // 유저로 주문한 것 검색
  async findOrdersByUser(userId: number): Promise<Order[]> {
    this.logger.log(`사용자 주문 조회 요청: 사용자 ${userId}`);
    const orders = await this.orderRepository.findOrdersByUser(userId);

    if (!orders.length) {
      this.logger.warn(`주문 내역 없음: 사용자 ${userId}`);
      throw new NotFoundException('주문 내역이 없습니다.');
    }
    return this.orderRepository.findOrdersByUser(userId);
  }

  // 주문내역 검색
  async getOrderDetails(orderId: number): Promise<Order> {
    this.logger.log(`주문 상세 조회 요청: 주문 ID ${orderId}`);
    const order = await this.orderRepository.getOrderDetails(orderId);

    if (!order) {
      this.logger.warn(`주문 찾을 수 없음: 주문 ID ${orderId}`);
      throw new NotFoundException(`주문 ID ${orderId}를 찾을 수 없습니다.`);
    }
    return order;
  }

  // 주문상태 변경
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
    this.logger.log(
      `주문 상태 업데이트 요청: 주문 ID ${orderId}, 상태 ${status}`,
    );
    await this.orderRepository.updateOrderStatus(orderId, status);
    this.logger.log(`주문 상태 업데이트 완료: 주문 ID ${orderId}`);
  }

  // 주문 삭제
  async deleteOrder(orderId: number): Promise<void> {
    this.logger.log(`주문 삭제 요청: 주문 ID ${orderId}`);
    await this.orderRepository.deleteOrder(orderId);
    this.logger.log(`주문 삭제 완료: 주문 ID ${orderId}`);
  }
}
