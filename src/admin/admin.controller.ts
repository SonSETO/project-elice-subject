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
  async getTodayNewUsersCount() {
    const count = await this.adminService.getTodayNewUsersCount();
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
    summary: '오늘의 베스트 상품 조회',
    description:
      '오늘 (00:00 - 23:59) 동안 판매량 기준으로 상위 N개의 상품을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘의 베스트 상품 리스트',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: '인기 상품' },
          totalQuantity: { type: 'number', example: 150 },
          imageUrl: {
            type: 'string',
            example: 'https://example.com/image.jpg',
          },
        },
      },
    },
  })
  @Get('today-best-products')
  async getTodayBestProducts(@Query('limit') limit = 5) {
    const products = await this.adminService.getTodayBestProducts(limit);
    return products.map((product) => ({
      id: product.id,
      title: product.title,
      // product에 타입 걍 넣어줄지 따로 할지 고민 일단 이렇게 진행
      //@ts-ignore
      totalQuantity: product.totalQuantity,
      //@ts-ignore
      imageUrl: product.imageUrl,
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
