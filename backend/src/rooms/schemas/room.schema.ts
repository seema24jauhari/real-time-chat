import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type RoomDocument = Room & Document

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true, enum: ['channel', 'dm'] })
  type: string

  @Prop({ type: String, default: null, unique: true, sparse: true })
  name: string | null

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'User', default: null})
  created_by: Types.ObjectId | null

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  last_message: Types.ObjectId

  @Prop({ default: null })
  last_activity: Date
}

export const RoomSchema = SchemaFactory.createForClass(Room)