import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class Room extends Document {
  @Prop({ required: true, enum: ['channel', 'dm'] })
  type: string

  @Prop({ default: null })
  name: string

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  members: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'User' })
  created_by: Types.ObjectId
}

export const RoomSchema = SchemaFactory.createForClass(Room)