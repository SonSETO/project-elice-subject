import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserService } from 'src/users/interface/user.interface';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUserService') private readonly userService: IUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = this.getClientFromContext(context);
    const authHeader = client.handshake.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('토큰이 필요합니다.');
    }

    const token = this.extractToken(authHeader);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('유효하지 않은 사용자입니다.');
      }

      client.user = { ...user, sub: payload.sub };
      return true;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private extractToken(authHeader: string): string {
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('토큰 형식이 잘못되었습니다.');
    }
    return token;
  }

  private getClientFromContext(context: ExecutionContext): any {
    if (context.getType() === 'ws') {
      return context.switchToWs().getClient();
    }
    throw new UnauthorizedException('WebSocket 요청이 아닙니다.');
  }
}
