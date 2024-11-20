import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { IAddressRepository } from './interface/address.repository.interface';

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async createAddress(
    userId: number,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    const address = this.addressRepository.create({
      ...createAddressDto,
      user: { id: userId },
    });
    return this.addressRepository.save(address);
  }

  async findAddressesByUser(userId: number): Promise<Address[]> {
    return this.addressRepository.find({ where: { user: { id: userId } } });
  }

  async deleteAddress(addressId: number, userId: number): Promise<void> {
    await this.addressRepository.delete({
      id: addressId,
      user: { id: userId },
    });
  }

  async setDefaultAddress(addressId: number, userId: number): Promise<Address> {
    await this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('userId = :userId', { userId })
      .execute();

    await this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: true })
      .where('id = :addressId', { addressId })
      .execute();

    return this.addressRepository.findOneOrFail({ where: { id: addressId } });
  }
}
