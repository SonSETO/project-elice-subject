import {
  Controller,
  Get,
  Query,
  Inject,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { IAdminService } from './interface/admin.service.interface';

@ApiTags('관리자 대시보드')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata('roles', ['admin'])
@Controller('admin')
export class AdminController {
  constructor(
    @Inject('IAdminService') private readonly adminService: IAdminService,
  ) {}

  @ApiOperation({
    summary: '신규 가입자 수 조회',
    description:
      '오늘 (00:00 - 23:59) 동안 신규 가입한 사용자 수를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘 신규 가입자 수',
    schema: { example: { count: 5 } },
  })
  @Get('new-users')
  async getNewUsersCount() {
    const count = await this.adminService.getNewUsersCount();
    return { count };
  }

  @ApiOperation({
    summary: '오늘의 주문 수 조회',
    description: '오늘 (00:00 - 23:59) 생성된 주문의 총 개수를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘 생성된 주문 수',
    schema: { example: { count: 10 } },
  })
  @Get('today-orders')
  async getTodayOrdersCount() {
    const count = await this.adminService.getTodayOrdersCount();
    return { count };
  }

  @ApiOperation({
    summary: '금주의 베스트 상품 조회',
    description:
      '금주 (월요일 00:00 - 일요일 23:59) 동안 판매량 기준으로 상위 N개의 상품을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '금주의 베스트 상품 리스트',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: '인기 상품' },
          totalQuantity: { type: 'number', example: 150 },
        },
      },
    },
  })
  @Get('weekly-best-products')
  async getWeeklyBestProducts(@Query('limit') limit = 5) {
    const products = await this.adminService.getWeeklyBestProducts(limit);
    return products.map((product) => ({
      id: product.id,
      title: product.title,
      totalQuantity: product.orderItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
      imageUrl: product.images,
    }));
  }

  @ApiOperation({
    summary: '오늘의 매출 합계 조회',
    description:
      '오늘 (00:00 - 23:59) 동안 완료된 주문의 총 매출 금액을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘의 매출 합계',
    schema: { example: { revenue: 1000000 } },
  })
  @Get('today-revenue')
  async getTodayRevenue() {
    const revenue = await this.adminService.getTodayRevenue();
    return { revenue };
  }
}
