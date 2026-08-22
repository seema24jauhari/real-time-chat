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
import { RedisService } from 'src/redis/redis.service';
import { Types } from 'mongoose';
import { RoomsService } from 'src/rooms/rooms.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private onlineUsers = new Set<string>();

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
    private redisService: RedisService,
    private roomsService: RoomsService,
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
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // attach user to socket for later use
      client.data.user = payload;

      // join ALL user's rooms on connect
      const rooms = await this.roomsService.getUserRooms(payload.sub);
      rooms.forEach((room) => {
        client.join(room.id.toString());
        console.log(
          `${payload.sub} joined room ${room.id.toString()}  ${typeof room.id}`,
        );
      });

      // add to online set
      await this.redisService.setOnline(payload.sub);

      // broadcast to everyone that this user is online
      this.server.emit('user_online', { userId: payload.sub });
      console.log('authenticated:', payload.sub);
    } catch (err) {
      console.log('invalid token — disconnecting');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.user?.sub) {
      this.redisService.setOffline(client.data.user.sub);

      // broadcast that user went offline
      this.server.emit('user_offline', { userId: client.data.user.sub });
    }
    console.log('disconnected:', client.id);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    // verify user is actually a member of this room
    const room = await this.roomsService.findById(roomId)
    const isMember = room?.members.some(
      m => m.toString() === client.data.user?.sub
    )
    
    if (!isMember) {
      return { error: 'Not authorized to join this room' }
    }

    client.join(roomId)
    return { success: true }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; content: string; type?: string; filename?: string },
  ) {
    const message = await this.messagesService.create({
      room_id: new Types.ObjectId(data.roomId),
      sender_id: new Types.ObjectId(client.data.user?.sub),
      content: data.content,
      type: data.type || 'text',
      filename: data.filename,
    });

    this.server.to(data.roomId).emit('receive_message', {
      _id: message._id,
      room_id: data.roomId,
      content: message.content,
      type: message.type,
      filename: message.filename,
      sender_id: {
        _id: client.data.user?.sub,
        name: client.data.user?.name,
        avatarUrl: client.data.user?.avatarUrl,
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
      name: client.data.user?.name,
      roomId,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(roomId).emit('user_stop_typing', {
      userId: client.data.user?.sub,
      roomId,
    });
  }

  // endpoint to get all online users
  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    return {
      onlineUsers: Array.from(await this.redisService.getOnlineUsers()),
    };
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const userId = client.data.user?.sub;

    // update all unread messages in this room
    await this.messagesService.markAllRead(roomId, userId);

    // notify others in room that messages were read
    client.to(roomId).emit('messages_read', {
      roomId,
      userId,
    });
  }
}
