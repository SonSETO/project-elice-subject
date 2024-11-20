import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  CategoryName,
  ProductGender,
  ProductSize,
} from 'src/common/utils/enum/product-enum';

export class CreateProductDto {
  @ApiProperty({ example: '상의', description: '상품의 카테고리' })
  @IsEnum(CategoryName)
  @IsNotEmpty()
  category: CategoryName;

  @ApiProperty({ example: '남성용 셔츠', description: '상품 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '남자', description: '상품의 대상 성별' })
  @IsEnum(ProductGender)
  @IsNotEmpty()
  productGender: ProductGender;

  @ApiProperty({ example: '50000', description: '상품 가격' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: '고급 면 소재 셔츠', description: '상품 설명' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '미디움', description: '상품 사이즈' })
  @IsEnum(ProductSize)
  @IsNotEmpty()
  size: ProductSize;

  // @ApiProperty({
  //   type: 'array',
  //   items: { type: 'string', format: 'binary' },
  //   description: '상품 이미지 파일',
  //   example: ['image1.jpg', 'image2.jpg'],
  // })
  // @IsNotEmpty({ each: true })
  // images: Express.Multer.File[];
}
