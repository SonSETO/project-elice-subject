import { Product } from '../entities/product.entity';
import { Images } from 'src/images/entities/image.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CategoryName } from 'src/common/utils/enum/product-enum';

export interface IProductRepository {
  createProduct(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product>;

  saveImages(images: Images[]): Promise<void>;

  getProductById(id: number): Promise<Product | null>;

  updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    images: Images[],
  ): Promise<Product>;

  deleteProduct(id: number): Promise<void>;

  toggleLike(
    productId: number,
    userId: number,
    isLike: boolean,
  ): Promise<{ likeCountChange: number }>;

  getLikedProductsByUser(userId: number): Promise<Product[]>;

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
