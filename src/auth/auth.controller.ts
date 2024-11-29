import { Controller, Post, Body } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IAuthService } from './interface/auth.service.interface';
import { LoginDto } from './dto/login.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService,
  ) {}

  @ApiOperation({
    summary: '인증 코드 발송',
    description:
      '입력된 이메일 주소로 인증 코드를 전송합니다. 이 코드는 회원가입을 완료하기 위해 필요합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: '인증 코드를 전송할 이메일 주소',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '인증 코드가 성공적으로 발송되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 이메일 형식 또는 기타 요청 오류.',
  })
  @Post('email/send-authentication')
  async sendAuthMail(@Body('email') email: string) {
    await this.authService.sendAuthMail(email);
    return { message: '인증 코드가 성공적으로 발송되었습니다.' };
  }

  @ApiOperation({
    summary: '인증 코드 확인',
    description: '입력된 이메일 주소와 인증 코드를 확인합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: '인증 코드를 확인할 이메일 주소',
        },
        code: {
          type: 'string',
          example: '123456',
          description: '이메일로 발송된 인증 코드',
        },
      },
      required: ['email', 'code'],
    },
  })
  @ApiResponse({ status: 200, description: '인증 코드 확인 완료.' })
  @ApiResponse({
    status: 400,
    description: '인증 코드가 만료되었거나 코드가 올바르지 않습니다.',
  })
  @Post('email/verify')
  async validateAuthCode(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    await this.authService.validateAuthCode(email, code);
    return { message: '인증 코드 확인이 성공적으로 완료되었습니다.' };
  }

  @ApiOperation({
    summary: '회원가입',
    description:
      '인증 코드를 확인한 뒤 회원 정보를 입력하여 회원가입을 완료합니다.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: '회원가입이 성공적으로 완료되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '유효성 검사 실패 또는 이미 존재하는 이메일.',
  })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 인증을 진행하여 JWT 토큰을 반환합니다.',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      example: {
        message: '로그인 성공',
        accessToken: 'jwt_access_token',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 이메일 또는 비밀번호.' })
  @ApiResponse({ status: 401, description: '권한이 없습니다.' })
  @ApiBearerAuth()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
