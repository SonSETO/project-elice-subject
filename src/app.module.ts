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
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/entity/chat.entity';
import { ChatRoom } from './chat/entity/chat-room.entity';

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
        type: configService.get<string>(envVariableKeys.DB_TYPE) as 'mysql',
        host: configService.get<string>(envVariableKeys.DB_HOST),
        port: configService.get<number>(envVariableKeys.DB_PORT),
        username: configService.get<string>(envVariableKeys.DB_USERNAME),

        database: configService.get<string>(envVariableKeys.DB_DATABASE),
        entities: [
          User,
          Address,
          Product,
          Images,
          Order,
          OrderItem,
          Chat,
          ChatRoom,
        ],
        synchronize:
          configService.get<string>(envVariableKeys.ENV) === 'prod'
            ? false
            : true,
        ...(configService.get<string>(envVariableKeys.ENV) === 'prod' && {
          ssl: {
            rejectUnauthorized: false,
          },
        }),
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
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomLoggerService],
  exports: [CustomLoggerService],
})
export class AppModule {}
