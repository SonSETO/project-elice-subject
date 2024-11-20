import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomLoggerService } from 'src/common/logger.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: CustomLoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.log(
      `역할 인증 요청: ${request.method} ${request.url}, 역할: ${roles}`,
    );

    if (!roles) {
      return true;
    }

    if (!user) {
      this.logger.warn(`사용자 정보 누락`);
      throw new UnauthorizedException('사용자 정보가 없습니다.');
    }

    if (!roles.includes(user.userRole)) {
      this.logger.warn(`권한 없음: ${user.email}, 역할: ${user.userRole}`);
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    this.logger.log(`역할 인증 성공: ${user.email}`);
    return true;
  }
}
