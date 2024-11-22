import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  //dto 전체적인 유효성 검사 추가
  @ApiProperty({
    description: '수령인 이름',
    example: '홍길동',
  })
  @IsNotEmpty()
  @IsString()
  recipientName: string;

  @ApiProperty({
    description: '수령인 연락처',
    example: '010-1234-5678',
  })
  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @ApiProperty({
    description: '주소 별칭 (예: 집, 회사)',
    example: '집',
  })
  @IsNotEmpty()
  @IsString()
  addressName: string;

  @ApiProperty({
    description: '실제 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: '기본 배송지 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  // userId:number

  // 컨트롤러 넘길 떄 userId:userId=number
}
