import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderStatus } from 'src/common/utils/enum/order.status-enum';

export interface IOrderRepository extends Repository<Order> {
  createOrder(
    userId: number,
    addressId: number,
    items: any[],
    totalPrice: number,
  ): Promise<Order>;

  findOrdersByUser(userId: number): Promise<Order[]>;

  getOrderDetails(orderId: number): Promise<Order>;

  updateOrderStatus(orderId: number, status: OrderStatus): Promise<void>;

  deleteOrder(orderId: number): Promise<void>;
}
