import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IUserService } from './interface/user.interface';

@ApiTags('사용자 관리')
@Controller('users')
export class UserController {
  constructor(
    @Inject('IUserService') private readonly userService: IUserService,
  ) {}

  @ApiOperation({
    summary: '모든 사용자 조회',
    description: '모든 사용자의 정보를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 목록이 성공적으로 반환되었습니다.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          email: { type: 'string', example: 'user@example.com' },
          userRole: { type: 'string', example: 'user' },
          userGender: { type: 'string', example: '남자' },
          createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2024-01-02T00:00:00.000Z' },
        },
      },
    },
  })
  @Get()
  async findAllUsers() {
    return this.userService.findAllUsers();
  }

  @ApiOperation({
    summary: '사용자 조회',
    description: '사용자 ID를 기반으로 특정 사용자의 정보를 반환합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보가 성공적으로 반환되었습니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
        userRole: { type: 'string', example: 'user' },
        userGender: { type: 'string', example: '남자' },
        createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', example: '2024-01-02T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.findById(id);
  }

  @ApiOperation({
    summary: '사용자의 주문 조회',
    description: '특정 사용자가 주문한 내역을 반환합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '사용자의 주문 내역이 성공적으로 반환되었습니다.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          orderDate: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          totalPrice: { type: 'number', example: 10000 },
          orderStatus: { type: 'string', example: 'DELIVERED' },
          address: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              address: { type: 'string', example: '서울특별시 강남구...' },
            },
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'number', example: 1 },
                quantity: { type: 'number', example: 2 },
                unitPrice: { type: 'number', example: 5000 },
                totalPrice: { type: 'number', example: 10000 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자의 주문 내역을 찾을 수 없습니다.',
  })
  @Get(':id/orders')
  async findUserOrders(@Param('id') id: number) {
    return this.userService.findUserOrders(id);
  }

  @ApiOperation({
    summary: '사용자가 등록한 상품 조회',
    description: '특정 사용자가 등록한 모든 상품을 반환합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '사용자가 등록한 상품이 성공적으로 반환되었습니다.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: '셔츠' },
          price: { type: 'number', example: 50000 },
          description: { type: 'string', example: '고급 면 셔츠' },
          category: { type: 'string', example: '상의' },
          size: { type: 'string', example: '미디움' },
          productGender: { type: 'string', example: '남자' },
          createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자가 등록한 상품을 찾을 수 없습니다.',
  })
  @Get(':id/products')
  async findUserProducts(@Param('id') id: number) {
    return this.userService.findUserProducts(id);
  }
}
