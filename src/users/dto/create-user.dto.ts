import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { UserGender, UserRole } from 'src/common/utils/enum/user-enum';

export class CreateUserDto {
  @ApiProperty({
    description: '사용자의 이메일',
    example: 'user@example.com',
    required: true,
  })
  @IsNotEmpty({ message: '이메일은 필수 항목입니다.' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '사용자의 비밀번호',
    example: 'password123',
    required: true,
  })
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하여야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/, {
    message: '비밀번호는 영문, 숫자를 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({
    description: '비밀번호 확인',
    example: 'password123',
    required: true,
  })
  @IsNotEmpty({ message: '비밀번호 확인은 필수 항목입니다.' })
  @IsString({ message: '비밀번호 확인은 문자열이어야 합니다.' })
  @ValidateIf((o) => o.password === o.passwordConfirm)
  passwordConfirm: string;

  @ApiProperty({
    description: '사용자의 성별',
    enum: UserGender,
    example: UserGender.MALE,
    required: true,
  })
  @IsEnum(UserGender, {
    message: '성별은 남자 또는 여자 중 하나를 선택해야 합니다.',
  })
  @IsNotEmpty({ message: '성별은 필수 항목입니다.' })
  userGender: UserGender;

  // @ApiProperty({
  //   description: '사용자의 역할',
  //   enum: UserRole,
  //   example: UserRole.USER,
  //   required: true,
  // })
  // @IsEnum(UserRole, { message: '유효한 역할이 아닙니다.' })
  // @IsNotEmpty({ message: '역할은 필수 항목입니다.' })
  // userRole: UserRole;
}
