import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type MessageDocument = Message & Document & {
  createdAt: Date
  updatedAt: Date
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room_id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId

  @Prop({ required: true })
  content: string

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  read_by: Types.ObjectId[]
}

export const MessageSchema = SchemaFactory.createForClass(Message)