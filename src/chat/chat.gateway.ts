import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CustomLoggerService } from 'src/common/logger.service';
import { Server, Socket } from 'socket.io';
import { Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { WsJwtAuthGuard } from 'src/auth/guard/ws-auth.guard';

@WebSocketGateway()
@UseGuards(WsJwtAuthGuard)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: CustomLoggerService,

    @Inject('IAuthService') private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('App Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    // client.emit('connected', 'Successfully connected to the server.');
    try {
      this.logger.log(`New client connected...: ${client.id}`);

      const rawToken = client.handshake.headers.authorization;
      this.logger.log(`Authorization Header Received: ${rawToken || 'None'}`);

      if (!rawToken) {
        client.disconnect();
        throw new UnauthorizedException('토큰이 필요합니다');
      }

      const user = await this.authService.validateToken(rawToken);
      this.logger.log(`Token validated. User Payload: ${JSON.stringify(user)}`);
      client.data.user = user;

      this.chatService.registerClient(user.sub, client);
      this.logger.log(`Client registered with user ID: ${user.sub}`);

      await this.chatService.joinUserRooms(user, client);
      this.logger.log(`Client joined rooms: ${client.id}`);

      this.logger.log(`New client connected...: ${client.id}`);
      client.emit('connected', 'Successfully connected to the server.');
    } catch (e) {
      this.logger.error(
        `Connection error for client ${client.id}: ${e.message}`,
        e.stack,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const user = client.data.user;

    if (user) {
      this.chatService.removeClient(user.sub);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() body: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    console.log(user);
    await this.chatService.createMessage(user, body);
  }
}
