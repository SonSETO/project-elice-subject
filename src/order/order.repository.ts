import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { IOrderRepository } from './interface/order-repository.interface';
import { OrderStatus } from 'src/common/utils/enum/order.status-enum';
import { OrderItem } from './entities/order-item.entity';
import { CustomRepository } from 'src/common/custom-repository.decorator';

@CustomRepository(Order)
export class OrderRepository
  extends Repository<Order>
  implements IOrderRepository
{
  async createOrder(
    userId: number,
    addressId: number,
    items: any[],
    totalPrice: number,
  ): Promise<Order> {
    try {
      const order = this.create({
        user: { id: userId },
        address: { id: addressId },
        orderDate: new Date(),
        totalPrice,
      });

      /* 
        아직 추상화에 대한 개념이 부족한건지 지금 추상화 설계를 잘못한건지
        this.orderRepository.ceate()로 할 때  오더 아이템에 아이템들이 안들어가는 현상이 발생
      */
      // 이부분은 때려죽어도 안되서 gpt돌렸습니다
      order.items = items.map((item) =>
        this.manager.create(OrderItem, {
          product: { id: item.product.id },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }),
      );

      //

      const savedOrder = await this.save(order);

      return this.findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'items.product', 'address'],
      });
    } catch (error) {
      throw error;
    }
  }

  async findOrdersByUser(userId: number): Promise<Order[]> {
    return this.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'address'],
      order: { orderDate: 'DESC' },
    });
  }

  async getOrderDetails(orderId: number): Promise<Order> {
    return this.findOneOrFail({
      where: { id: orderId },
      relations: ['items', 'items.product', 'address'],
    });
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
    await this.createQueryBuilder()
      .update(Order)
      .set({ orderStatus: status })
      .where('id = :orderId', { orderId })
      .execute();
  }

  async deleteOrder(orderId: number): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(Order)
      .where('id = :orderId', { orderId })
      .execute();
  }
}
