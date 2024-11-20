import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Images } from 'src/images/entities/image.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/users/users.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { v4 as uuidv4 } from 'uuid';
import path, { join } from 'path';
import { ProductUserLike } from './entities/product-user-like.entity';
import { ProductRepository } from './product.repository';
import { LoggerModule } from 'src/common/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Images, ProductUserLike]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'products'),
        filename: (req, file, callback) => {
          const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];

          const split = file.originalname.split('.');
          let extension = '';

          if (split.length > 1) {
            extension = split[split.length - 1].toLowerCase(); //
          }

          if (!allowedExtensions.includes(extension)) {
            return callback(
              new Error('이미지 파일만 업로드 가능합니다.'),
              null,
            );
          }

          const uniqueName = `${uuidv4()}_${Date.now()}.${extension}`;
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
    JwtModule.register({}),
    UserModule,
    LoggerModule,
  ],
  controllers: [ProductController],
  providers: [
    {
      provide: 'IProductService',
      useClass: ProductService,
    },
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
  exports: ['IProductService', 'IProductRepository', TypeOrmModule],
})
export class ProductModule {}
