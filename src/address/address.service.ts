import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';

import { IAddressService } from './interface/address.service.interface';
import { Address } from './entities/address.entity';
import { CustomLoggerService } from 'src/common/logger.service';
import { AddressRepository } from './address.repository';

@Injectable()
export class AddressService implements IAddressService {
  constructor(
    @Inject(AddressRepository)
    private readonly addressRepository: AddressRepository,
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

    const createdAddress = await this.addressRepository.createAddress(
      userId,
      createAddressDto,
    );

    const savedAddress = await this.addressRepository.findOne({
      where: { id: createdAddress.id },
    });

    if (!savedAddress) {
      this.logger.error(
        `배송지 생성 실패: 사용자 ${userId}, 생성된 주소 ID ${createdAddress.id}`,
      );
      throw new NotFoundException('생성된 배송지를 찾을 수 없습니다.');
    }

    this.logger.log(
      `배송지 생성 완료: 사용자 ${userId}, 주소 ID ${savedAddress.id}`,
    );

    return savedAddress;
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

    await this.addressRepository.setDefaultAddress(addressId, userId);

    const updatedAddress = await this.addressRepository.findOne({
      where: {
        id: addressId,
        user: { id: userId },
        isDefault: true,
      },
      relations: ['user'],
    });

    if (!updatedAddress) {
      this.logger.error(
        `기본 배송지 설정 실패: 주소 ${addressId}, 사용자 ${userId}`,
      );
      throw new NotFoundException(
        '기본 배송지 설정에 실패했습니다. 요청한 주소를 찾을 수 없습니다.',
      );
    }

    this.logger.log(
      `기본 배송지 설정 완료: 주소 ${updatedAddress.id}, 사용자 ${userId}`,
    );

    return updatedAddress;
  }
}
