import { Inject, Injectable } from '@nestjs/common';
import { Images } from './entities/image.entity';
import { IImagesService } from './interface/images.service.interface';
import { ImagesRepository } from './images.repository';
import { CustomLoggerService } from 'src/common/logger.service';

@Injectable()
export class ImagesService implements IImagesService {
  constructor(
    @Inject(ImagesRepository)
    private readonly imagesRepository: ImagesRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async saveImages(images: Images[]): Promise<void> {
    this.logger.log(`이미지 저장 요청: ${images.length}개 이미지`);
    await this.imagesRepository.saveImages(images);
    this.logger.log('이미지 저장 완료');
  }

  async deleteImagesByProductId(productId: number): Promise<void> {
    this.logger.log(`이미지 삭제 요청: 상품 ID ${productId}`);
    await this.imagesRepository.deleteImagesByProductId(productId);
    this.logger.log(`상품 ID ${productId}의 이미지 삭제 완료`);
  }

  async findAll(): Promise<Images[]> {
    this.logger.log('모든 이미지 조회 요청');
    const images = await this.imagesRepository.findAll();
    this.logger.log(`모든 이미지 조회 완료: ${images.length}개`);
    return images;
  }

  async findImageById(id: number): Promise<Images | null> {
    this.logger.log(`이미지 조회 요청: 이미지 ID ${id}`);
    const image = await this.imagesRepository.findImageById(id);
    if (!image) {
      this.logger.warn(`이미지 조회 실패: 이미지 ID ${id}`);
      return null;
    }
    this.logger.log(`이미지 조회 성공: 이미지 ID ${id}`);
    return image;
  }

  async updateImages(productId: number, newImages: Images[]): Promise<void> {
    this.logger.log(`상품 ID ${productId}의 이미지 업데이트 요청`);

    await this.imagesRepository.deleteImagesByProductId(productId);

    await this.imagesRepository.saveImages(newImages);

    this.logger.log(`상품 ID ${productId}의 이미지 업데이트 완료`);
  }
}
