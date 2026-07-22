import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // get token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1]

      if (!token) {
        client.disconnect()
        return
      }

      // verify JWT
      console.log('authenticating token:', token)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      })

      // attach user to socket for later use
      client.data.user = payload
      console.log('authenticated:', payload.sub)

    } catch (err) {
      console.log('invalid token — disconnecting')
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    console.log('disconnected:', client.id)
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    client.join(roomId)
    console.log(`${client.data.user?.sub} joined room ${roomId}`)
  }

  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string }
  ) {
    this.server.to(data.roomId).emit('receive_message', {
      content: data.content,
      senderId: client.data.user?.sub,
      createdAt: new Date(),
    })
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    client.to(roomId).emit('user_typing', {
      userId: client.data.user?.sub
    })
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    client.to(roomId).emit('user_stop_typing', {
      userId: client.data.user?.sub
    })
  }
}