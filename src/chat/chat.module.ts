import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { LoggerModule } from 'src/common/logger.module';
import { Chat } from './entity/chat.entity';
import { ChatRoom } from './entity/chat-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat, ChatRoom]), LoggerModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
