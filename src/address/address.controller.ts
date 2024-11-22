import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { IAddressService } from './interface/address.service.interface';
import { CreateAddressDto } from './dto/create-address.dto';
import { UserId } from 'src/users/decorator/user-id.decorator';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('주소 관리')
@ApiBearerAuth()
@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(
    @Inject('IAddressService') private readonly addressService: IAddressService,
  ) {}

  @ApiOperation({
    summary: '배송지 추가',
    description: '사용자의 배송지를 추가합니다.',
  })
  @ApiBody({
    type: CreateAddressDto,
    description: '배송지 정보를 입력합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '배송지가 성공적으로 추가되었습니다.',
    type: CreateAddressDto,
  })
  @ApiResponse({
    status: 400,
    description: '입력값이 유효하지 않거나 요청이 잘못되었습니다.',
  })
  @Post()
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @UserId() userId: number,
  ) {
    return this.addressService.createAddress(userId, createAddressDto);
  }

  @ApiOperation({
    summary: '사용자 배송지 조회',
    description: '사용자의 모든 배송지를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '배송지 목록이 성공적으로 조회되었습니다.',
    type: CreateAddressDto,
  })
  @ApiResponse({ status: 404, description: '등록된 배송지가 없습니다.' })
  @Get(':userId')
  async findAddressesByUser(@UserId() userId: number) {
    return this.addressService.findAddressesByUser(userId);
  }

  @ApiOperation({
    summary: '배송지 삭제',
    description: '사용자의 특정 배송지를 삭제합니다.',
  })
  @ApiParam({
    name: 'addressId',
    description: '삭제할 배송지의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '배송지가 성공적으로 삭제되었습니다.',
    type: CreateAddressDto,
  })
  @ApiResponse({
    status: 404,
    description: '해당 배송지를 찾을 수 없습니다.',
  })
  @Delete(':addressId')
  async deleteAddress(
    @Param('addressId') addressId: number,
    @UserId() userId: number,
  ) {
    return this.addressService.deleteAddress(addressId, userId);
  }

  @ApiOperation({
    summary: '기본 배송지 설정',
    description: '특정 배송지를 기본 배송지로 설정합니다.',
  })
  @ApiParam({
    name: 'addressId',
    description: '기본으로 설정할 배송지 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '기본 배송지가 성공적으로 설정되었습니다.',
    type: CreateAddressDto,
  })
  @ApiResponse({
    status: 404,
    description: '배송지 설정 중 에러가 발생했습니다.',
  })
  @Post(':addressId/set-default')
  async setDefaultAddress(
    @Param('addressId') addressId: number,
    @UserId() userId: number,
  ) {
    return this.addressService.setDefaultAddress(addressId, userId);
  }
}
