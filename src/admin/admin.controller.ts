import {
  Controller,
  Get,
  Query,
  Inject,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';

@ApiTags('관리자 대시보드')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata('roles', ['admin'])
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: '신규 가입자 수 조회',
    description: '오늘 신규 가입자 수를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '신규 가입자 수',
    schema: { example: { count: 5 } },
  })
  @Get('new-users')
  async getNewUsersCount() {
    const count = await this.adminService.getNewUsersCount();
    return { count };
  }

  @ApiOperation({
    summary: '오늘의 주문 갯수 조회',
    description: '오늘 생성된 주문 수를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘의 주문 갯수',
    schema: { example: { count: 10 } },
  })
  @Get('today-orders')
  async getTodayOrdersCount() {
    const count = await this.adminService.getTodayOrdersCount();
    return { count };
  }

  @ApiOperation({
    summary: '가장 많이 좋아요가 눌린 상품 조회',
    description: '좋아요가 많은 순으로 상품을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 상위 상품 리스트',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: '인기 상품' },
          likeCount: { type: 'number', example: 150 },
        },
      },
    },
  })
  @Get('top-liked-products')
  async getTopLikedProducts(@Query('limit') limit = 5) {
    const products = await this.adminService.getTopLikedProducts(limit);
    return products;
  }

  @ApiOperation({
    summary: '금일 매출 합계 조회',
    description: '오늘 완료된 주문의 매출 합계를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '금일 매출 합계',
    schema: { example: { revenue: 1000000 } },
  })
  @Get('today-revenue')
  async getTodayRevenue() {
    const revenue = await this.adminService.getTodayRevenue();
    return { revenue };
  }
}
