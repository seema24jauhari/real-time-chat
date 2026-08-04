import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room } from './schemas/room.schema';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(Room.name) private roomModel: Model<Room>) {}

  async seedDefaultChannels() {
    const exisiting = await this.roomModel.findOne({
      name: 'general',
      type: 'channel',
    });
    if (!exisiting) {
      await this.roomModel.create({
        name: 'general',
        type: 'channel',
        members: [],
        created_by: null,
      });
    }
  }

  async findOrCreateDM(userId: string, memberId: string) {
    // check if DM already exists between these two users
    const existing = await this.roomModel
      .findOne({
        type: 'dm',
        members: { $all: [userId, memberId], $size: 2 },
      })
      .populate('members', 'name email'); // add this

    if (existing) {
      return {
        id: existing._id,
        type: existing.type,
        name: existing.name,
        members: existing.members.map((m: any) => ({
          id: m._id,
          name: m.name,
          email: m.email,
          initials: m.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        })),
      };
    }

    // create new DM room
    const room = await this.roomModel.create({
      type: 'dm',
      name: null,
      members: [userId, memberId],
      created_by: userId,
    });

    const populated = await room.populate('members', 'name email');

    return {
      id: populated._id,
      type: populated.type,
      name: populated.name,
      members: populated.members.map((m: any) => ({
        id: m._id,
        name: m.name,
        email: m.email,
        initials: m.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      })),
    };
  }

  async getRecentDms(userId: string) {
    // check if DM already exists between these me and other user

    const rooms = await this.roomModel
      .find({
        type: 'dm',
        members: { $in: [userId] }, // any room where I am a member
      })
      .sort({ last_activity: -1 })
      .populate('members', '_id name email');

    if (rooms)
      return rooms.map((room) => {
        return {
          id: room._id,
          type: room.type,
          name: room.name,
          members: room.members.map((m: any) => ({
            id: m._id,
            name: m.name,
            email: m.email,
            initials: m.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
          })),
        };
      });
    return null;
  }

  async addToDefaultChannels(userId: Types.ObjectId) {
    await this.roomModel.updateOne(
      { name: 'general', type: 'channel' },
      { $addToSet: { members: userId } }, // addToSet avoids duplicates
    );
  }

  async getRecentChannels(userId: string) {
    const generalChannel = await this.roomModel
      .findOne({
        type: 'channel',
        name: 'general',
        members: { $in: [userId] },
      })
      .populate('members', '_id name email');

    const otherChannels = await this.roomModel
      .find({
        type: 'channel',
        name: { $ne: 'general' },
        members: { $in: [userId] },
      })
      .sort({ last_activity: -1 })
      .populate('members', '_id name email');

    const channels = [generalChannel!, ...otherChannels];
    if (channels) {
      return channels.map((channel) => ({
        id: channel._id,
        type: channel.type,
        name: channel.name,
        members: channel.members.map((m: any) => ({
          id: m._id,
          name: m.name,
          email: m.email,
          initials: m.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        })),
      }));
    }
  }

  async getUserRooms(userId: string) {
    return this.roomModel
      .find({
        members: { $in: [userId] },
      })
      .select('_id');
  }
}
