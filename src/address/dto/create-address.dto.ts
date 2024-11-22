import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({
    description: '수령인 이름',
    example: '홍길동',
  })
  @IsNotEmpty({ message: '수령인 이름은 필수 입력 항목입니다.' })
  @IsString({ message: '수령인 이름은 문자열이어야 합니다.' })
  @Length(2, 50, { message: '수령인 이름은 2자 이상, 50자 이하이어야 합니다.' })
  recipientName: string;

  @ApiProperty({
    description: '연락처',
    example: '010-1234-5678',
  })
  @IsNotEmpty({ message: '연락처는 필수 입력 항목입니다.' })
  @IsString({ message: '연락처는 문자열이어야 합니다.' })
  @IsPhoneNumber('KR', { message: '유효한 한국 전화번호 형식이어야 합니다.' })
  contactNumber: string;

  @ApiProperty({
    description: '주소 별칭 (예: 집, 회사)',
    example: '집',
  })
  @IsNotEmpty({ message: '주소 별칭은 필수 입력 항목입니다.' })
  @IsString({ message: '주소 별칭은 문자열이어야 합니다.' })
  @Length(1, 30, { message: '주소 별칭은 1자 이상, 30자 이하이어야 합니다.' })
  addressName: string;

  @ApiProperty({
    description: '실제 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsNotEmpty({ message: '주소는 필수 입력 항목입니다.' })
  @IsString({ message: '주소는 문자열이어야 합니다.' })
  @Length(10, 100, { message: '주소는 10자 이상, 100자 이하이어야 합니다.' })
  address: string;

  @ApiProperty({
    description: '기본 배송지 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '기본 배송지 여부는 true 또는 false 값이어야 합니다.' })
  isDefault?: boolean;

  // userId:number

  // 컨트롤러 넘길 떄 userId:userId=number
}
