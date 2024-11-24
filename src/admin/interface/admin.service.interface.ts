import { Product } from 'src/product/entities/product.entity';
import { AdminDto } from '../dto/admin.dto';

export interface IAdminService {
  getTodayNewUsersCount(): Promise<number>;

  getTodayOrdersCount(): Promise<number>;

  getTodayBestProducts(limit: number): Promise<Product[]>;

  getTodayRevenue(): Promise<number>;
}
