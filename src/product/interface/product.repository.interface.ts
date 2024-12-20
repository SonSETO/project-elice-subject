import { Product } from '../entities/product.entity';
import { Images } from 'src/images/entities/image.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CategoryName } from 'src/common/utils/enum/product-enum';
import { Repository } from 'typeorm';

export interface IProductRepository extends Repository<Product> {
  createProduct(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product>;

  getProductById(id: number): Promise<Product | null>;

  updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    images: Images[],
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
}
