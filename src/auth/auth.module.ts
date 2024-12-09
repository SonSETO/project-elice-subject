import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { IAuthService } from './interface/auth.service.interface';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { LoggerModule } from 'src/common/logger.module';
import { CustomRepositoryModule } from 'src/common/custom-repository.module';
import { UserRepository } from 'src/users/users.repository';
import { UserService } from 'src/users/users.service';
import { WsJwtAuthGuard } from './guard/ws-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('GOOGLE_EMAIL'),
            pass: configService.get<string>('GOOGLE_EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"우삼겹 고추장 순두부찌개" <${configService.get<string>('GOOGLE_EMAIL')}>`,
        },
      }),
    }),
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
    CustomRepositoryModule.forCustomRepository([UserRepository]),
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [
    WsJwtAuthGuard,
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    {
      provide: 'IUserService',
      useClass: UserService,
    },
  ],
  exports: ['IAuthService', WsJwtAuthGuard],
})
export class AuthModule {}
