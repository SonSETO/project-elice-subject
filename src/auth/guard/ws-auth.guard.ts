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
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUserService') private readonly userService: IUserService,
    private readonly logger: CustomLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = this.getClientFromContext(context);
    const authHeader = client.handshake.headers['authorization'];
    this.logger.log(`Authorization Header: ${authHeader || 'None'}`);

    if (!authHeader) {
      this.logger.warn('no AuthHeader header found');
      throw new UnauthorizedException('토큰이 필요합니다.');
    }

    const token = this.extractToken(authHeader);
    this.logger.log(`Extracted Token : ${token}`);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      this.logger.log(`Token Payload: ${JSON.stringify(payload)}`);

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        this.logger.warn(`User not found for ID: ${payload.sub}`);
        throw new UnauthorizedException('유효하지 않은 사용자입니다.');
      }
      this.logger.log(
        `User authenticated: ${JSON.stringify({ ...user, sub: payload.sub })}`,
      );

      client.data.user = { ...user, sub: payload.sub };

      return true;
    } catch (error) {
      this.logger.error(`JWT Verification Error: ${error.message}`);
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private extractToken(authHeader: string): string {
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      this.logger.error(`Invalid token format: ${authHeader}`);
      throw new UnauthorizedException('토큰 형식이 잘못되었습니다.');
    }
    return token;
  }

  private getClientFromContext(context: ExecutionContext): any {
    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      this.logger.log(`WebSocket client connected: ${client.id}`);
      return client;
    }
    this.logger.error('Not a WebSocket request');
    throw new UnauthorizedException('WebSocket 요청이 아닙니다.');
  }
}
