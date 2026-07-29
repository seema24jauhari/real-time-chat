import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../../messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // get token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // verify JWT
      console.log('authenticating token:', token);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // attach user to socket for later use
      client.data.user = payload;
      console.log('authenticated:', payload.sub);
    } catch (err) {
      console.log('invalid token — disconnecting');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('disconnected:', client.id);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    console.log(`${client.data.user?.sub} joined room ${roomId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    // save to MongoDB
    const message = await this.messagesService.create({
      room_id: data.roomId,
      sender_id: client.data.user?.sub,
      content: data.content,
    });

    // broadcast to everyone in room
    this.server.to(data.roomId).emit('receive_message', {
      _id: message._id,
      content: message.content,
      sender_id: {
        _id: client.data.user?.sub,
        name: client.data.user?.name,
      },
      createdAt: message.createdAt,
    });
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.to(roomId).emit('user_typing', {
      userId: client.data.user?.sub,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.to(roomId).emit('user_stop_typing', {
      userId: client.data.user?.sub,
    });
  }
}
