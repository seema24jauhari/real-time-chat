import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as argon2 from 'argon2';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  findByEmailWithPasswordHash(email: string) {
    return this.userModel.findOne({ email }).select('+password_hash');
  }

  findByIdForMFA(userId: string) {
    return this.userModel.findOne({ id: userId }).select('+mfa_secret');
  }

  create(email: string, password_hash: string, name: string) {
    return this.userModel.create({
      email,
      password_hash,
      name,
      is_active: true,
    });
  }

  async findOrCreateOAuthUser(data: {
    email: string;
    provider: string;
    providerId: string;
    name: string;
  }) {
    let user = await this.userModel.findOne({ email: data.email });
    if (!user) {
      user = await this.userModel.create({
        email: data.email,
        provider: data.provider,
        providerId: data.providerId,
        name: data.name,
      });
    }
    return user;
  }

  async search(q: string, userId: string) {
    if (!q || q.trim().length === 0) return [];

    const users = await this.userModel
      .find({
        name: { $regex: q, $options: 'i' },
        _id: { $ne: userId }, // exclude current user
      })
      .select('_id name email')
      .limit(10);

    return users.map((user) => ({
      id: user._id,
      email: user.email,
      name: user.name,
      initials: user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    }));
  }

  updateOne(filter: any, update: any) {
    return this.userModel.updateOne(filter, update);
  }

  findOne(filter: any) {
    return this.userModel.findOne(filter);
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto, userId: string) {
    // find user with password (select: false means need explicit select)
    const user = await this.userModel.findById(userId).select('+password_hash');
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await argon2.verify(
      user.password_hash,
      updatePasswordDto.currentPassword,
    );
    if (!isMatch)
      throw new NotFoundException('Current password is incorrect');

    // hash new password and save
    user.password_hash = await argon2.hash(updatePasswordDto.newPassword, {
      type: argon2.argon2id,
    });

    await user.save();
    return { message: 'Password updated successfully' };
  }
}
