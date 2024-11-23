import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { UserRepository } from './users.repository';
import { OrderModule } from 'src/order/order.module';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { Address } from 'src/address/entities/address.entity';
import { LoggerModule } from 'src/common/logger.module';
import { CustomRepositoryModule } from 'src/common/custom-repository.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CustomRepositoryModule.forCustomRepository([UserRepository]),
    LoggerModule,
  ],
  controllers: [UserController],
  providers: [
    {
      provide: 'IUserService',
      useClass: UserService,
    },
    // {
    //   provide: 'IUserRepository',
    //   useClass: UserRepository,
    // },
  ],
  exports: ['IUserService'],
})
export class UserModule {}
