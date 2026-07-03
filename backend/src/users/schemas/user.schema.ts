import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
// users/schemas/user.schema.ts
@Schema({ timestamps: { createdAt: 'created_at' } })
export class User {
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ select: false }) password_hash: string;
  @Prop({ type: [String], default: ['user'] }) roles: string[];
  @Prop({ select: false }) mfa_secret?: string;
  @Prop({ default: true }) is_active: boolean;
  @Prop() provider?: string; // 'google' | 'github' | undefined for email/password
  @Prop() providerId?: string; // the ID Google/GitHub gave this user
  @Prop({ default: false }) mfa_enabled: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);
