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
    this.logger.log(`Client register : User ID ${userId}`);
  }

  removeClient(userId: number) {
    this.connectedClients.delete(userId);
    this.logger.log(`Client remove : User ID ${userId}`);
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

    this.logger.log(`User ID ${user.sub} joined ${chatRooms.length} rooms.`);
  }

  async createMessage(
    payload: { sub: number },
    { message, otherUserId }: CreateChatDto,
  ) {
    this.logger.log(
      `Creating message: ${message} for otherUserId: ${otherUserId}`,
    );

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      this.logger.warn(`User not found: ${payload.sub}`);
      throw new WsException('User not found');
    }

    const chatRoom = await this.findOrCreateRoom(user, otherUserId);
    if (!chatRoom) {
      this.logger.warn(
        `ChatRoom not found or created for room: ${otherUserId}`,
      );
      throw new WsException('ChatRoom not found');
    }

    const msgModel = await this.chatRepository.save({
      author: user,
      message,
      chatRoom,
    });

    this.broadcastMessage(chatRoom.id, msgModel);

    return msgModel;
  }

  async findOrCreateRoom(user: User, otherUserId: number) {
    const userIds = [user.id, otherUserId].sort();
    const uniqueKey = userIds.join('_');

    let chatRoom = await this.chatRoomRepository.findOne({
      where: {
        uniqueKey,
      },
      relations: ['users'],
    });

    if (!chatRoom) {
      const otherUser = await this.userRepository.findOne({
        where: { id: otherUserId },
      });
      if (!otherUser) {
        throw new WsException('상대방 유저를 찾을 수 없습니다.');
      }

      chatRoom = this.chatRoomRepository.create({
        uniqueKey,
        users: [user, otherUser],
      });

      chatRoom = await this.chatRoomRepository.save(chatRoom);
      this.logger.log(`새로운 채팅룸 생성 고유키 : ${uniqueKey}`);
    } else {
      this.logger.log(`채팅방과 고유키를 찾을 수 없습니다. : ${uniqueKey}`);
    }
    return chatRoom;
  }

  broadcastMessage(roomId: number, message: Chat) {
    this.logger.log(
      `Broadcasting message to room ${roomId}: ${JSON.stringify(message)}`,
    );
    const clientIds = Array.from(this.connectedClients.keys());
    clientIds.forEach((userId) => {
      const client = this.connectedClients.get(userId);
      if (client) {
        client
          .to(roomId.toString())
          .emit('newMessage', plainToClass(Chat, message));
        this.logger.log(`Message sent to room ${roomId}: ${message.message}`);
      }
    });
  }
}
