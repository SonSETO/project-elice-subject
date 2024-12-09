import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { ChatRoom } from './entity/chat-room.entity';
import { Chat } from './entity/chat.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { plainToClass } from 'class-transformer';
import { UserRole } from 'src/common/utils/enum/user-enum';
import { WsException } from '@nestjs/websockets';
import { CustomLoggerService } from 'src/common/logger.service';

@Injectable()
export class ChatService {
  private readonly connectedClients = new Map<number, Socket>();

  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: CustomLoggerService,
  ) {}

  registerClient(userId: number, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: number) {
    this.connectedClients.delete(userId);
  }

  async joinUserRooms(user: { sub: number }, client: Socket) {
    const chatRooms = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .innerJoin('chatRoom.users', 'user', 'user.id = :userId', {
        userId: user.sub,
      })
      .getMany();

    chatRooms.forEach((room) => {
      client.join(room.id.toString());
    });
  }

  async createMessage(
    payload: { sub: number },
    { message, room }: CreateChatDto,
  ) {
    this.logger.log(`Creating message: ${message} for room: ${room}`);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      this.logger.warn(`User not found: ${payload.sub}`);
      throw new WsException('User not found');
    }

    const chatRoom = await this.getOrCreateChatRoom(user, room);
    if (!chatRoom) {
      this.logger.warn(`ChatRoom not found or created for room: ${room}`);
      throw new WsException('ChatRoom not found');
    }

    const msgModel = await this.chatRepository.save({
      author: user,
      message,
      chatRoom,
    });
    this.logger.log(`Message saved: ${JSON.stringify(msgModel)}`);

    const client = this.connectedClients.get(user.id);
    if (client) {
      client
        .to(chatRoom.id.toString())
        .emit('newMessage', plainToClass(Chat, msgModel));
      this.logger.log(`New message emitted to room: ${chatRoom.id}`);
    }

    return msgModel;
  }

  // async getOrCreateChatRoom(user: User, room?: number) {
  //   if (room) {
  //     const existingRoom = await this.chatRoomRepository.findOne({
  //       where: { id: room },
  //     });
  //     if (existingRoom) {
  //       return existingRoom;
  //     }
  //   }

  //   const adminUser = await this.userRepository.findOne({
  //     where: { userRole: UserRole.ADMIN },
  //   });

  //   if (!adminUser) {
  //     throw new WsException('Admin user not found');
  //   }

  //   const newRoom = await this.chatRoomRepository.save({
  //     users: [user, adminUser],
  //   });

  //   [user.id, adminUser.id].forEach((userId) => {
  //     const client = this.connectedClients.get(userId);
  //     if (client) {
  //       client.emit('roomCreated', newRoom.id);
  //       client.join(newRoom.id.toString());
  //     }
  //   });

  //   return newRoom;
  // }
  async getOrCreateChatRoom(user: User, roomId?: number) {
    if (roomId) {
      const existingRoom = await this.chatRoomRepository.findOne({
        where: { id: roomId },
        relations: ['users'],
      });
      if (existingRoom) {
        if (!existingRoom.users.some((u) => u.id === user.id)) {
          existingRoom.users.push(user);
          await this.chatRoomRepository.save(existingRoom);
        }
        return existingRoom;
      }
    }

    const adminUser = await this.userRepository.findOne({
      where: { userRole: UserRole.ADMIN },
    });
    if (!adminUser) {
      throw new WsException('Admin user not found');
    }

    const newRoom = this.chatRoomRepository.create({
      users: [user, adminUser],
    });
    return await this.chatRoomRepository.save(newRoom);
  }
}
