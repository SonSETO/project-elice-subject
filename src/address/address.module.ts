import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/product/entities/product.entity';
import { AddressRepository } from './address.repository';
import { Address } from './entities/address.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/users/users.module';
import { LoggerModule } from 'src/common/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Address]),
    JwtModule.register({}),
    UserModule,
    LoggerModule,
  ],
  controllers: [AddressController],
  providers: [
    {
      provide: 'IAddressService',
      useClass: AddressService,
    },
    {
      provide: 'IAddressRepository',
      useClass: AddressRepository,
    },
  ],
  exports: ['IAddressService'],
})
export class AddressModule {}
