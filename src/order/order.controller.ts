import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  UseGuards,
  UseInterceptors,
  Put,
} from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { IOrderService } from './interface/order-service.interface';

import { UserId } from 'src/users/decorator/user-id.decorator';

import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderStatus } from 'src/common/utils/enum/order.status-enum';

@ApiTags('주문 관리')
@Controller('order')
export class OrderController {
  constructor(
    @Inject('IOrderService') private readonly orderService: IOrderService,
  ) {}

  @ApiOperation({
    summary: '주문 생성',
    description: '사용자가 상품을 주문합니다.',
  })
  @ApiBody({
    description: '주문 생성 요청 데이터',
    type: CreateOrderDto,
  })
  @ApiResponse({
    status: 201,
    description: '주문이 성공적으로 생성되었습니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 123 },
        orderDate: { type: 'string', example: '2024-11-20T00:00:00.000Z' },
        totalPrice: { type: 'number', example: 150000 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'number', example: 1 },
              quantity: { type: 'number', example: 2 },
              unitPrice: { type: 'number', example: 75000 },
              totalPrice: { type: 'number', example: 150000 },
            },
          },
        },
        address: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 5 },
            address: { type: 'string', example: '서울특별시 강남구' },
            recipientName: { type: 'string', example: '홍길동' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '요청 데이터가 유효하지 않습니다.',
  })
  @Post()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @UserId() userId: number,
  ) {
    return this.orderService.createOrder(createOrderDto, userId);
  }

  @ApiOperation({
    summary: '사용자 주문 내역 조회',
    description: '사용자가 주문한 모든 주문 내역을 조회합니다.',
  })
  @ApiParam({
    name: 'userId',
    description: '사용자 ID',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: '사용자의 주문 내역을 반환합니다.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 10 },
          totalPrice: { type: 'number', example: 150000 },
          orderDate: { type: 'string', example: '2024-11-20T00:00:00.000Z' },
          address: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              address: { type: 'string', example: '서울특별시 강남구' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '주문 내역이 없습니다.',
  })
  @Get(':userId')
  async findOrdersByUser(@Param('userId') userId: number) {
    return this.orderService.findOrdersByUser(userId);
  }

  @ApiOperation({
    summary: '주문 상세 조회',
    description: '특정 주문의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'orderId',
    description: '주문 ID',
    example: 12,
  })
  @ApiResponse({
    status: 200,
    description: '주문 상세 정보를 반환합니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12 },
        orderDate: { type: 'string', example: '2024-11-20T00:00:00.000Z' },
        totalPrice: { type: 'number', example: 150000 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'number', example: 1 },
              quantity: { type: 'number', example: 2 },
              unitPrice: { type: 'number', example: 75000 },
              totalPrice: { type: 'number', example: 150000 },
            },
          },
        },
        address: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 5 },
            address: { type: 'string', example: '서울특별시 강남구' },
            recipientName: { type: 'string', example: '홍길동' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '주문 정보를 찾을 수 없습니다.',
  })
  @Get('details/:orderId')
  async getOrderDetails(@Param('orderId') orderId: number) {
    return this.orderService.getOrderDetails(orderId);
  }

  @ApiOperation({
    summary: '주문 상태 업데이트',
    description: '주문의 상태를 업데이트합니다.',
  })
  @ApiParam({
    name: 'orderId',
    description: '주문 ID',
    example: 12,
  })
  @ApiParam({
    name: 'status',
    description: '주문 상태',
    example: '배송 중',
  })
  @ApiResponse({
    status: 200,
    description: '주문 상태가 성공적으로 업데이트되었습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '주문 정보를 찾을 수 없습니다.',
  })
  @Put(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: number,
    @Body('status') status: OrderStatus,
  ) {
    return this.orderService.updateOrderStatus(orderId, status);
  }
}
