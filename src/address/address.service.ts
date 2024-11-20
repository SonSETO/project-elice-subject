import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { IAddressRepository } from './interface/address.repository.interface';
import { IAddressService } from './interface/address.service.interface';
import { Address } from './entities/address.entity';
import { CustomLoggerService } from 'src/common/logger.service';

@Injectable()
export class AddressService implements IAddressService {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async createAddress(userId: number, createAddressDto: CreateAddressDto) {
    this.logger.log(`배송지 생성 요청: 사용자 ${userId}`);
    const existingAddresses =
      await this.addressRepository.findAddressesByUser(userId);

    if (existingAddresses.length >= 5) {
      this.logger.warn(`배송지 초과 등록 시도: 사용자 ${userId}`);
      throw new BadRequestException(
        '배송지는 최대 5개까지만 등록할 수 있습니다.',
      );
    }

    const address = this.addressRepository.createAddress(
      userId,
      createAddressDto,
    );
    this.logger.log(
      `배송지 생성 완료: 사용자 ${userId}, 주소 ${(await address).id}`,
    );
    return address;
  }

  async findAddressesByUser(userId: number) {
    this.logger.log(`배송지 조회 요청: 사용자 ${userId}`);
    const addresses = await this.addressRepository.findAddressesByUser(userId);

    if (!addresses.length) {
      this.logger.warn(`배송지 없음: 사용자 ${userId}`);
      throw new NotFoundException('등록된 배송지가 없습니다.');
    }
    return addresses;
  }

  async deleteAddress(addressId: number, userId: number): Promise<void> {
    this.logger.log(`배송지 삭제 요청: 주소 ${addressId}, 사용자 ${userId}`);
    await this.addressRepository.deleteAddress(addressId, userId);
    this.logger.log(`배송지 삭제 완료: 주소 ${addressId}, 사용자 ${userId}`);
  }

  async setDefaultAddress(addressId: number, userId: number): Promise<Address> {
    this.logger.log(
      `기본 배송지 설정 요청: 주소 ${addressId}, 사용자 ${userId}`,
    );
    const address = await this.addressRepository.setDefaultAddress(
      addressId,
      userId,
    );
    this.logger.log(
      `기본 배송지 설정 완료: 주소 ${addressId}, 사용자 ${userId}`,
    );
    return address;
  }
}
