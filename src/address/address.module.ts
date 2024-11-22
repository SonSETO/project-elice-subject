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
import { CustomRepositoryModule } from 'src/common/custom-repository.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product]),
    JwtModule.register({}),
    UserModule,
    CustomRepositoryModule.forCustomRepository([AddressRepository]),
    LoggerModule,
  ],
  controllers: [AddressController],
  providers: [
    {
      provide: 'IAddressService',
      useClass: AddressService,
    },
  ],
  exports: ['IAddressService'],
})
export class AddressModule {}
