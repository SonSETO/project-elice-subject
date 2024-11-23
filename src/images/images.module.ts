import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomRepositoryModule } from 'src/common/custom-repository.module';
import { ImagesRepository } from './images.repository';
import { LoggerModule } from 'src/common/logger.module';
import { Images } from './entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Images]),
    CustomRepositoryModule.forCustomRepository([ImagesRepository]),
    LoggerModule,
  ],
  controllers: [ImagesController],
  providers: [
    {
      provide: 'IImagesService',
      useClass: ImagesService,
    },
  ],
  exports: ['IImagesService'],
})
export class ImagesModule {}
