import { Images } from '../entities/image.entity';

export interface IImagesService {
  saveImages(images: Images[]): Promise<void>;

  deleteImagesByProductId(productId: number): Promise<void>;

  findAll(): Promise<Images[]>;

  findImageById(id: number): Promise<Images | null>;

  updateImages(productId: number, newImages: Images[]): Promise<void>;
}
