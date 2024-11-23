import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { CustomRepository } from 'src/common/custom-repository.decorator';
import { IAddressRepository } from './interface/address.repository.interface';

@CustomRepository(Address)
export class AddressRepository
  extends Repository<Address>
  implements IAddressRepository
{
  async createAddress(
    userId: number,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    const address = this.create({
      ...createAddressDto,
      user: { id: userId },
    });
    return this.save(address);
  }

  async findAddressesByUser(userId: number): Promise<Address[]> {
    return this.find({ where: { user: { id: userId } } });
  }

  async deleteAddress(addressId: number, userId: number): Promise<void> {
    await this.delete({
      id: addressId,
      user: { id: userId },
    });
  }

  async setDefaultAddress(addressId: number, userId: number): Promise<Address> {
    await this.createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('userId = :userId', { userId })
      .execute();

    await this.createQueryBuilder()
      .update(Address)
      .set({ isDefault: true })
      .where('id = :addressId', { addressId })
      .execute();

    return this.findOneOrFail({ where: { id: addressId } });
  }
}
