import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(data: {
    room_id: Types.ObjectId;
    sender_id: Types.ObjectId;
    content?: string;
    type?: string;
    filename?: string;
  }) {
    return this.messageModel.create({...data, type: data.type || 'text'});
  }

  async findByRoom(roomId: string, cursor?: string, limit = 20) {
    const query: any = { room_id: new Types.ObjectId(roomId) };

    // if cursor provided, get messages before it
    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const messages = await this.messageModel
      .find(query)
      .populate('sender_id', 'name email avatarUrl') // populate sender_id with name, email, and avatarUrl
      .sort({ _id: -1 }) // newest first
      .limit(limit);

    return messages.reverse(); // return oldest first for display
  }

  async markAllRead(roomId: string, userId: string) {
    await this.messageModel.updateMany(
      {
        room_id: new Types.ObjectId(roomId),
        sender_id: { $ne: new Types.ObjectId(userId) },
        read_by: { $nin: [new Types.ObjectId(userId)] },
      },
      { $addToSet: { read_by: new Types.ObjectId(userId) } },
    );

  }

  async unreadMessages(userId: string) {
    const result = await this.messageModel.aggregate([
      {
        $match: {
          sender_id: { $ne: new Types.ObjectId(userId) },
          read_by: { $nin: [new Types.ObjectId(userId)] },
        },
      },
      {
        $group: {
          _id: '$room_id',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          room_id: '$_id',
          count: 1,
        },
      },
    ]);

    return result;
  }
}
