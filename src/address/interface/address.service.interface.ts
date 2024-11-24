import { CreateAddressDto } from '../dto/create-address.dto';
import { Address } from '../entities/address.entity';

// 반환타입 맞춰서 Swagger에서 type:Dto사용하는 거 체크
export interface IAddressService {
  createAddress(
    userId: number,
    createAddressDto: CreateAddressDto,
  ): Promise<any>;

  findAddressesByUser(userId: number): Promise<Address[]>;

  deleteAddress(addressId: number, userId: number): Promise<void>;

  setDefaultAddress(addressId: number, userId: number): Promise<Address>;
}
