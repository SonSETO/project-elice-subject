import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from 'src/common/logger.service';
import { IUserService } from 'src/users/interface/user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUserService') private readonly userService: IUserService,
    private readonly logger: CustomLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    this.logger.log(`JWT 인증 요청: ${method} ${url}`);

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      this.logger.warn(`인증 헤더 누락: ${method} ${url}`);
      throw new UnauthorizedException('토큰이 필요합니다.');
    }

    const token = this.extractToken(authHeader);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        this.logger.warn(`유효하지 않은 사용자: ${payload.sub}`);
        throw new UnauthorizedException('유효하지 않은 사용자입니다.');
      }

      request['user'] = { ...user, sub: payload.sub };
      this.logger.log(`JWT 인증 성공: ${user.email}`);
      return true;
    } catch (error) {
      this.logger.error(`JWT 인증 실패: ${method} ${url}`, error.message);
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private extractToken(authHeader: string): string {
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      this.logger.warn(`토큰 형식 불일치: ${authHeader}`);
      throw new UnauthorizedException('토큰 형식이 잘못되었습니다.');
    }
    return token;
  }
}
