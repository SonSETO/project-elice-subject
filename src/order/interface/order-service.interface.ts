import { CreateOrderDto } from '../dto/create-order.dto';
import { Order } from '../entities/order.entity';

export interface IOrderService {
  createOrder(orderDto: CreateOrderDto, userId: number): Promise<Order>;

  findOrdersByUser(userId: number): Promise<Order[]>;

  getOrderDetails(orderId: number): Promise<Order>;

  updateOrderStatus(orderId: number, status: string): Promise<void>;

  deleteOrder(orderId: number): Promise<void>;
}
