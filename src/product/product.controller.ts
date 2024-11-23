import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  UploadedFiles,
  UseInterceptors,
  Inject,
  UseGuards,
  SetMetadata,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { IProductService } from './interface/product.interface';

import { RoleGuard } from 'src/auth/guard/role.guard';
import { UserId } from 'src/users/decorator/user-id.decorator';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { CategoryName } from 'src/common/utils/enum/product-enum';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';

@ApiTags('상품 관리')
@Controller('product')
export class ProductController {
  constructor(
    @Inject('IProductService') private readonly productService: IProductService,
  ) {}

  @ApiOperation({
    summary: '상품 생성',
    description: '새로운 상품을 생성합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '상품 생성에 필요한 데이터와 이미지',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '고급 셔츠' },
        description: { type: 'string', example: '멋진 고급 셔츠입니다.' },
        price: { type: 'number', example: 50000 },
        size: {
          type: 'string',
          enum: ['스몰', '미디움', '라지', '엑스라지'],
          example: '미디움',
        },
        productGender: {
          type: 'string',
          enum: ['남자', '여자', '남녀공용'],
          example: '남녀공용',
        },
        category: {
          type: 'string',
          enum: ['상의', '하의', '코트', '신발', '모자'],
          example: '상의',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '상품이 성공적으로 생성되었습니다.',
    schema: {
      example: {
        id: 1,
        title: '고급 셔츠',
        description: '멋진 고급 셔츠입니다.',
        price: 50000,
        size: '미디움',
        productGender: '남녀공용',
        category: '상의',
        likeCount: 0,
        images: [
          { id: 1, url: '/uploads/products/image1.jpg' },
          { id: 2, url: '/uploads/products/image2.jpg' },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: '입력 데이터가 유효하지 않습니다.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @SetMetadata('roles', ['admin'])
  @UseInterceptors(FilesInterceptor('images', 3), TransactionInterceptor)
  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UserId() userId: number,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.productService.createProduct(createProductDto, images, userId);
  }

  @ApiOperation({
    summary: '상품 조회',
    description: '상품 ID를 기반으로 상품 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '상품 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '상품이 성공적으로 조회되었습니다.',
    schema: {
      example: {
        id: 1,
        title: '고급 셔츠',
        description: '멋진 고급 셔츠입니다.',
        price: 50000,
        size: '미디움',
        productGender: '남녀공용',
        category: '상의',
        likeCount: 0,
        images: [
          { id: 1, url: '/uploads/products/image1.jpg' },
          { id: 2, url: '/uploads/products/image2.jpg' },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @Get(':id')
  async getProduct(@Param('id') id: number) {
    return this.productService.getProduct(id);
  }

  @ApiOperation({
    summary: '상품 수정',
    description: '기존 상품 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '상품 ID', example: 1 })
  @ApiBody({
    description: '수정된 상품 데이터와 이미지 파일',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '업데이트된 셔츠' },
        description: { type: 'string', example: '업데이트된 멋진 셔츠입니다.' },
        price: { type: 'number', example: 60000 },
        size: {
          type: 'string',
          enum: ['스몰', '미디움', '라지', '엑스라지'],
          example: '라지',
        },
        productGender: {
          type: 'string',
          enum: ['남자', '여자', '남녀공용'],
          example: '남자',
        },
        category: {
          type: 'string',
          enum: ['상의', '하의', '코트', '신발', '모자'],
          example: '코트',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '상품이 성공적으로 수정되었습니다.',
  })
  @ApiResponse({ status: 400, description: '입력 데이터가 유효하지 않습니다.' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @SetMetadata('roles', ['admin'])
  @UseInterceptors(FilesInterceptor('images', 3), TransactionInterceptor)
  @Put(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.productService.updateProduct(id, updateProductDto, images);
  }

  @ApiOperation({
    summary: '상품 삭제',
    description: '상품 ID를 기반으로 상품을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '상품 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '상품이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @SetMetadata('roles', ['admin'])
  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    return this.productService.deleteProduct(id);
  }

  @ApiOperation({
    summary: '모든 상품 조회',
    description: '페이징과 제한을 기반으로 모든 상품 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: '페이지 번호',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: '페이지당 항목 수',
  })
  @ApiResponse({
    status: 200,
    description: '상품 목록 조회 성공',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: '고급 셔츠',
            price: 50000,
            description: '고급 면 셔츠',
            productGender: '남자',
            category: '상의',
            size: '미디움',
            likeCount: 10,
            images: [
              { id: 1, url: '/uploads/products/image1.jpg' },
              { id: 2, url: '/uploads/products/image2.jpg' },
            ],
          },
        ],
        meta: { total: 50, page: 1, lastPage: 5 },
      },
    },
  })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @Get()
  async getAllProducts(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.productService.getAllProducts(Number(page), Number(limit));
  }

  @ApiOperation({
    summary: '카테고리별 상품 조회',
    description: '특정 카테고리에 속하는 상품 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'category',
    description: '상품 카테고리',
    enum: ['상의', '하의', '코트', '신발', '모자'],
    example: '상의',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: '페이지 번호',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: '페이지당 항목 수',
  })
  @ApiResponse({
    status: 200,
    description: '카테고리별 상품 목록 조회 성공',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: '고급 셔츠',
            price: 50000,
            description: '고급 면 셔츠',
            productGender: '남자',
            category: '상의',
            size: '미디움',
            likeCount: 10,
            images: [
              { id: 1, url: '/uploads/products/image1.jpg' },
              { id: 2, url: '/uploads/products/image2.jpg' },
            ],
          },
        ],
        meta: { total: 20, page: 1, lastPage: 2 },
      },
    },
  })
  @ApiResponse({ status: 404, description: '해당 카테고리에 상품이 없습니다.' })
  @Get('category/:category')
  async getProductsByCategory(
    @Param('category') category: CategoryName,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productService.getProductsByCategory(
      category,
      Number(page),
      Number(limit),
    );
  }

  // @ApiOperation({
  //   summary: '상품 좋아요',
  //   description: '사용자가 특정 상품에 대해 좋아요를 누르거나 취소합니다.',
  // })
  // @ApiParam({ name: 'id', description: '상품 ID', example: 1 })
  // @ApiBody({
  //   description: '좋아요 여부',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       isLike: {
  //         type: 'boolean',
  //         example: true,
  //         description: '좋아요 여부. true이면 좋아요, false이면 취소',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: '좋아요 상태가 변경되었습니다.',
  //   schema: {
  //     example: {
  //       message: '상품 좋아요 상태 변경 완료',
  //     },
  //   },
  // })
  // @ApiResponse({ status: 400, description: '요청이 유효하지 않습니다.' })
  // @Post(':id/like')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(TransactionInterceptor)
  // async toggleProductLike(
  //   @Param('id') productId: number,
  //   @UserId() userId: number,
  //   @Body('isLike') isLike: boolean,
  // ) {
  //   return this.productService.toggleProductLike(productId, userId, isLike);
  // }

  // @ApiOperation({
  //   summary: '상품 싫어요',
  //   description: '사용자가 특정 상품에 대해 싫어요를 누르거나 취소합니다.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: '싫어요 상태가 변경되었습니다.',
  //   schema: {
  //     example: {
  //       message: '상품 싫어요 상태 변경 완료',
  //     },
  //   },
  // })
  // @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  // @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  // @ApiParam({ name: 'id', description: '상품 ID', example: 1 })
  // @ApiBody({
  //   description: '싫어요 여부',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       dislike: {
  //         type: 'boolean',
  //         example: true,
  //         description: '싫어요 여부',
  //       },
  //     },
  //   },
  // })
  // @Post(':id/dislike')
  // @UseGuards(JwtAuthGuard)
  // async toggleProductDislike(
  //   @Param('id') productId: number,
  //   @UserId() userId: number,
  //   @Body() dislike: boolean,
  // ) {
  //   return this.productService.toggleProductLike(productId, userId, false);
  // }

  // @ApiOperation({
  //   summary: '사용자가 좋아요 누른 상품 조회',
  //   description: '사용자가 좋아요를 누른 모든 상품을 조회합니다.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: '사용자가 좋아요를 누른 상품 리스트',
  //   schema: {
  //     type: 'array',
  //     items: {
  //       type: 'object',
  //       properties: {
  //         id: { type: 'number', example: 1 },
  //         title: { type: 'string', example: '셔츠' },
  //         price: { type: 'string', example: '50000' },
  //         description: { type: 'string', example: '고급 면 셔츠' },
  //         productGender: { type: 'string', example: '남자' },
  //         category: { type: 'string', example: '상의' },
  //         size: { type: 'string', example: '미디움' },
  //         images: {
  //           type: 'array',
  //           items: {
  //             type: 'object',
  //             properties: {
  //               id: { type: 'number', example: 1 },
  //               url: {
  //                 type: 'string',
  //                 example: '/uploads/products/image1.jpg',
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: '사용자가 좋아요를 누른 상품이 없습니다.',
  // })
  // @ApiParam({ name: 'userId', description: '사용자 ID', example: 1 })
  // @Get(':userId/liked')
  // @UseGuards(JwtAuthGuard)
  // async getLikedProducts(@Param('userId') userId: number) {
  //   return this.productService.getLikedProducts(userId);
  // }
}
