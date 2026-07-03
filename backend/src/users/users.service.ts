import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  findByEmailWithPasswordHash(email: string) {
    return this.userModel.findOne({ email }).select('+password_hash');
  }

  findByIdForMFA(userId: string) {
    return this.userModel.findOne({ id: userId }).select('+mfa_secret');
  }

  create(email: string, password_hash: string) {
    return this.userModel.create({
      email,
      password_hash,
      is_active: true,
    });
  }

  async findOrCreateOAuthUser(data: {
    email: string;
    provider: string;
    providerId: string;
  }) {
    let user = await this.userModel.findOne({ email: data.email });
    if (!user) {
      user = await this.userModel.create({
        email: data.email,
        provider: data.provider,
        providerId: data.providerId,
      });
    }
    return user;
  }
}
