import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User {
  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true, select: false })
  password_hash: string

  @Prop({ select: false, default: null })
  mfa_secret?: string

  @Prop({ default: true })
  is_active: boolean

  @Prop({ type: String, default: null })
  provider?: string

  @Prop({ type: String, default: null })
  providerId?: string | null

  @Prop({ default: false })
  mfa_enabled: boolean

  @Prop({ type: String, default: null, select: false })
  resetToken: string | null

  @Prop({ type: Date, default: null, select: false })
  resetTokenExpiry: Date | null

  @Prop({ default: null }) avatarUrl: string
}

export const UserSchema = SchemaFactory.createForClass(User)