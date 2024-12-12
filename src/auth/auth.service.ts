import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateUserDto } from 'src/users/dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { IAuthService } from './interface/auth.service.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { MailerService } from '@nestjs-modules/mailer';
import { UserRole } from 'src/common/utils/enum/user-enum';
import { CustomLoggerService } from 'src/common/logger.service';
import { hashPassword } from 'src/common/utils/hashpassword.util';
import { UserRepository } from 'src/users/users.repository';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailerService: MailerService,
    private readonly logger: CustomLoggerService,
    @Inject('IUserService')
    private readonly userService: UserService,
  ) {}

  // 인증 메일 전송
  async sendAuthMail(email: string): Promise<void> {
    this.logger.log(`이메일 인증 요청: ${email}`);

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      this.logger.warn(`이미 가입된 이메일: ${email}`);
      throw new BadRequestException('이미 가입된 이메일입니다!');
    }

    const existingCode = await this.cacheManager.get(email);
    if (existingCode) {
      this.logger.warn(`인증 코드가 이미 발송됨: ${email}`);

      throw new BadRequestException(
        '이미 인증 코드가 발송되었습니다. 잠시 후 다시 시도하세요.',
      );
    }

    const authCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.cacheManager.set(email, authCode, { ttl: 300 } as any);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '인증코드요',
        text: `인증코드요 ${authCode}`,
        html: `<p>인증코드요 <strong>${authCode}</strong></p>`,
      });

      this.logger.log(`인증 코드 전송 완료: ${email}`);
    } catch (error) {
      console.error('인증코드요:', error.message);
      this.logger.error(`인증 코드 전송 실패: ${email}`, error.message);
      throw new BadRequestException('이메일 전송 실패');
    }
  }

  // 인증메일 속 코드 검증
  async validateAuthCode(email: string, code: string): Promise<void> {
    this.logger.log(`인증 코드 검증 요청: ${email}, 코드: ${code}`);
    const storedCode = await this.cacheManager.get<string>(email);

    if (!storedCode) {
      this.logger.warn(`인증 코드 만료: ${email}`);
      throw new BadRequestException('인증 코드가 만료되었습니다.');
    }

    if (storedCode !== code) {
      this.logger.warn(`인증 코드 불일치: ${email}`);
      throw new BadRequestException('인증 코드가 일치하지 않습니다.');
    }

    await this.cacheManager.set(`${email}_verified`, true, { ttl: 300 } as any);

    await this.cacheManager.del(email);
    this.logger.log(`인증 코드 검증 성공: ${email}`);
  }

  // 회원가입
  async register(createUserDto: CreateUserDto) {
    const { email, password, userGender, passwordConfirm } = createUserDto;
    this.logger.log(`회원가입 요청: ${email}`);

    // 인증 상태 확인
    const isVerified = await this.cacheManager.get(`${email}_verified`);
    if (!isVerified) {
      this.logger.warn(`이메일 인증 미완료: ${email}`);
      throw new BadRequestException('이메일 인증이 완료되지 않았습니다.');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      this.logger.warn(`이미 가입된 이메일: ${email}`);
      throw new BadRequestException('이미 가입된 이메일입니다!');
    }

    const hashedPassword = await hashPassword(password, this.configService);

    // 컨트롤단에 올려보기
    if (password !== passwordConfirm) {
      this.logger.warn('비밀번호 불일치');
      throw new BadRequestException('비밀번호와 재확인이 일치하지 않습니다.');
    }

    await this.userRepository.save({
      email,
      password: hashedPassword,
      userRole: UserRole.USER,
      userGender,
    });

    const savedUser = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    this.logger.log(`회원가입 성공: ${email}, ID: ${savedUser.id}`);
    return savedUser;
  }

  // 로그인
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`로그인 요청: ${email}`);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`존재하지 않는 이메일로 로그인 시도: ${email}`);
      throw new BadRequestException('이메일 또는 비밀번호를 확인해주세요.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`비밀번호 불일치: ${email}`);
      throw new BadRequestException('이메일 또는 비밀번호를 확인해주세요.');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`로그인 성공: ${email}`);
    return {
      message: '로그인 성공',
      accessToken,
    };
  }

  // 토근검증 재사용
  async validateToken(authHeader: string): Promise<any> {
    this.logger.log(`Auth Header 수신: ${authHeader}`);

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      this.logger.warn(`Invalid token format: ${authHeader}`);
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      this.logger.log(`유요한 token: ${token}`);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      this.logger.log(`토큰 페이로드: ${JSON.stringify(payload)}`);

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        this.logger.warn(`User not found: ${payload.sub}`);
        throw new UnauthorizedException('Invalid user');
      }

      this.logger.log(`User validated: ${JSON.stringify(user)}`);
      return { ...user, sub: payload.sub };
    } catch (error) {
      this.logger.error('Token validation failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
