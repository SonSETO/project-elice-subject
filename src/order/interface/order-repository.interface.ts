import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  createOrder(
    userId: number,
    addressId: number,
    items: any[],
    totalPrice: number,
  ): Promise<Order>;

  findOrdersByUser(userId: number): Promise<Order[]>;

  getOrderDetails(orderId: number): Promise<Order>;

  updateOrderStatus(orderId: number, status: string): Promise<void>;

  deleteOrder(orderId: number): Promise<void>;
}
