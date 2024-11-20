import { CreateAddressDto } from '../dto/create-address.dto';
import { Address } from '../entities/address.entity';

export interface IAddressRepository {
  createAddress(
    userId: number,
    createAddressDto: CreateAddressDto,
  ): Promise<Address>;

  findAddressesByUser(userId: number): Promise<Address[]>;

  deleteAddress(addressId: number, userId: number): Promise<void>;

  setDefaultAddress(addressId: number, userId: number): Promise<Address>;
}
