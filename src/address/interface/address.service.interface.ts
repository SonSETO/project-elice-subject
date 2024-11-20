import { CreateAddressDto } from '../dto/create-address.dto';
import { Address } from '../entities/address.entity';

export interface IAddressService {
  createAddress(
    userId: number,
    createAddressDto: CreateAddressDto,
  ): Promise<any>;

  findAddressesByUser(userId: number): Promise<Address[]>;

  deleteAddress(addressId: number, userId: number): Promise<void>;

  setDefaultAddress(addressId: number, userId: number): Promise<Address>;
}
