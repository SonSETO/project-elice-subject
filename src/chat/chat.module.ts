import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { LoggerModule } from 'src/common/logger.module';
import { Chat } from './entity/chat.entity';
import { ChatRoom } from './entity/chat-room.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/users/users.module';
import { WsJwtAuthGuard } from 'src/auth/guard/ws-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Chat, ChatRoom]),
    LoggerModule,
    AuthModule,
    JwtModule,
    UserModule,
  ],
  providers: [ChatGateway, ChatService, WsJwtAuthGuard],
})
export class ChatModule {}
