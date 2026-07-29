import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Message, MessageSchema } from './message.schema'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { ChatGateway } from 'src/gateway/chat/chat.gateway'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}