import { Order } from 'src/order/entities/order.entity';
import { User } from '../entities/user.entity';
import { Product } from 'src/product/entities/product.entity';

export interface IUserRepository {
  findAllUsers(): Promise<User[]>;

  findById(id: number): Promise<User>;

  findOrdersByUserId(userId: number): Promise<Order[]>;

  findProductsByUserId(userId: number): Promise<Product[]>;
}
