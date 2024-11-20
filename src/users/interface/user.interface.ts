import { Order } from 'src/order/entities/order.entity';
import { User } from '../entities/user.entity';
import { Product } from 'src/product/entities/product.entity';

export interface IUserService {
  findAllUsers(): Promise<User[]>;

  findById(id: number): Promise<User>;

  findUserOrders(userId: number): Promise<Order[]>;

  findUserProducts(userId: number): Promise<Product[]>;
}
