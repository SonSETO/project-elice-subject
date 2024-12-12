import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CustomLoggerService } from 'src/common/logger.service';
import { Server, Socket } from 'socket.io';
import { Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { WsJwtAuthGuard } from 'src/auth/guard/ws-auth.guard';

@WebSocketGateway({ namespace: '/chat', cors: true })
@UseGuards(WsJwtAuthGuard)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly logger: CustomLoggerService,
    @Inject('IAuthService') private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized.');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`New client connected: ${client.id}`);
      const rawToken = client.handshake.headers.authorization;

      if (!rawToken) {
        client.disconnect();
        throw new UnauthorizedException('Authorization token required.');
      }

      const user = await this.authService.validateToken(rawToken);
      this.logger.log(`Token validated for User ID: ${user.sub}`);

      client.data.user = user;
      this.chatService.registerClient(user.sub, client);

      await this.chatService.joinUserRooms(user, client);

      client.emit('connected', 'Successfully connected to the chat gateway.');
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.chatService.removeClient(user.sub);
      this.logger.log(
        `Client disconnected: ${client.id}, User ID: ${user.sub}`,
      );
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() body: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        throw new WsException('유저 인증 실패');
      }

      this.logger.log(
        `Message from User ${user.sub} to User ${body.otherUserId}: ${body.message}`,
      );

      const message = await this.chatService.createMessage(user, body);
      client.emit('messageSent', {
        success: true,
        messageId: message.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Message handling failed: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('roomId') roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;
      if (!user) throw new UnauthorizedException('User not authenticated.');

      client.join(roomId.toString());
      this.logger.log(`User ${user.sub} joined room ${roomId}`);
      client.emit('roomJoined', { success: true, roomId });
    } catch (error) {
      this.logger.error(`Join room failed: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody('roomId') roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;
      if (!user) throw new UnauthorizedException('User not authenticated.');

      client.leave(roomId.toString());
      this.logger.log(`User ${user.sub} left room ${roomId}`);
      client.emit('roomLeft', { success: true, roomId });
    } catch (error) {
      this.logger.error(`Leave room failed: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }
}
