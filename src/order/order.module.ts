import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Address } from 'src/address/entities/address.entity';
import { Product } from 'src/product/entities/product.entity';
import { OrderRepository } from './order.repository';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { UserModule } from 'src/users/users.module';
import { ProductRepository } from 'src/product/product.repository';
import { ProductModule } from 'src/product/product.module';
import { LoggerModule } from 'src/common/logger.module';
import { CustomRepositoryModule } from 'src/common/custom-repository.module';
import { AddressRepository } from 'src/address/address.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Address, Product, User]),
    JwtModule.register({}),
    CustomRepositoryModule.forCustomRepository([
      OrderRepository,
      ProductRepository,
      AddressRepository,
    ]),
    UserModule,
    ProductModule,
    LoggerModule,
  ],
  controllers: [OrderController],
  providers: [
    {
      provide: 'IOrderService',
      useClass: OrderService,
    },

    // {
    //   provide: 'IProductRepository',
    //   useClass: ProductRepository,
    // },
  ],
  exports: ['IOrderService'],
})
export class OrderModule {}
