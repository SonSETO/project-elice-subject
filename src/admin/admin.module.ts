import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/users/users.module';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';
import { LoggerModule } from 'src/common/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Product]),
    JwtModule,
    UserModule,
    OrderModule,
    ProductModule,
    LoggerModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
