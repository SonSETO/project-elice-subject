import { CategoryName } from 'src/common/utils/enum/product-enum';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { UpdateProductDto } from '../dto/update-product.dto';

export interface IProductService {
  createProduct(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    userId: number,
  ): Promise<Product>;

  getProduct(id: number): Promise<Product>;

  updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ): Promise<Product>;

  deleteProduct(id: number): Promise<void>;

  getAllProducts(
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; meta: any }>;

  getProductsByCategory(
    category: CategoryName,
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; meta: any }>;

  // toggleProductLike(
  //   productId: number,
  //   userId: number,
  //   isLike: boolean,
  // ): Promise<{ message: string }>;

  // getLikedProducts(userId: number): Promise<Product[]>;
}
