import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true }) // ← this adds createdAt and updatedAt automatically
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room_id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId

  @Prop({ required: true })
  content: string

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  read_by: Types.ObjectId[]

  createdAt: Date
}

export type MessageDocument = Message & Document
export const MessageSchema = SchemaFactory.createForClass(Message)