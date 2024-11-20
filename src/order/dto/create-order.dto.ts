import { IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item';

export class CreateOrderDto {
  @ApiProperty({
    description: '배송지 ID',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  addressId: number;

  @ApiProperty({
    description: '주문 상품 목록',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
