import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envVariableKeys } from './common/const/env.const';

import { User } from './users/entities/user.entity';
import { AddressModule } from './address/address.module';
import { Address } from './address/entities/address.entity';
import { ProductModule } from './product/product.module';

import { ProductUserLike } from './product/entities/product-user-like.entity';
import { Product } from './product/entities/product.entity';

import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { Images } from './images/entities/image.entity';
import { OrderModule } from './order/order.module';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { UserModule } from './users/users.module';
import { CustomLoggerService } from './common/logger.service';
import { LoggerModule } from './common/logger.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('mysql').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),

        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariableKeys.dbType) as 'mysql',
        host: configService.get<string>(envVariableKeys.dbHOST),
        port: configService.get<number>(envVariableKeys.dbPORT),
        username: configService.get<string>(envVariableKeys.dbUSERNAME),

        database: configService.get<string>(envVariableKeys.dbDATABASE),
        entities: [
          User,
          Address,
          ProductUserLike,
          Product,

          Images,
          Order,
          OrderItem,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AddressModule,
    ProductModule,
    LoggerModule,
    AuthModule,
    ImagesModule,
    OrderModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomLoggerService],
  exports: [CustomLoggerService],
})
export class AppModule {}
