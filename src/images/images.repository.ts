import { CustomRepository } from 'src/common/custom-repository.decorator';
import { Repository } from 'typeorm';
import { Images } from './entities/image.entity';
import { IImagesRepository } from './interface/images.repository';

@CustomRepository(Images)
export class ImagesRepository
  extends Repository<Images>
  implements IImagesRepository
{
  async saveImages(images: Images[]): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(Images)
      .values(images)
      .execute();
  }

  async deleteImagesByProductId(productId: number): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(Images)
      .where('productId = :productId', { productId })
      .execute();
  }

  async findAll(): Promise<Images[]> {
    return this.createQueryBuilder('images')
      .leftJoinAndSelect('images.product', 'product')
      .getMany();
  }

  async findImageById(id: number): Promise<Images | null> {
    return this.createQueryBuilder('images')
      .where('images.id = :id', { id })
      .getOne();
  }

  async updateImages(productId: number, newImages: Images[]): Promise<void> {
    await this.deleteImagesByProductId(productId);

    await this.saveImages(newImages);
  }
}
