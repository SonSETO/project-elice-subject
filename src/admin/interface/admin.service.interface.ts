import { Product } from 'src/product/entities/product.entity';

export interface IAdminService {
  getNewUsersCount(): Promise<number>;

  getTodayOrdersCount(): Promise<number>;

  getWeeklyBestProducts(limit: number): Promise<Product[]>;

  getTodayRevenue(): Promise<number>;
}
