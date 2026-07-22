import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from './schemas/room.schema';

@Injectable()
export class RoomsService {
    constructor(@InjectModel(Room.name) private roomModel: Model<Room>) {}

    async findOrCreateDM(userId: string, memberId: string) {
        // check if DM already exists between these two users
        const existing = await this.roomModel.findOne({
            type: 'dm',
            members: { $all: [userId, memberId], $size: 2 }
        }).populate('members', 'name email')  // add this

        if (existing) return existing

        // create new DM room
        const room = await this.roomModel.create({
            type: 'dm',
            name: null,
            members: [userId, memberId],
            created_by: userId
        })

        return room.populate('members', 'name email')
    }


    async getRecentDms(userId: string) {
        // check if DM already exists between these me and other user
       const rooms = await this.roomModel.find({
        type: 'dm',
        members: { $in: [userId] } // any room where I am a member
        }).populate('members', '_id name email')

        if (rooms) 
        return rooms.map((room)=>{
            let initSign  = ""
           
            return {
                id:room._id,
                type:room.type,
                name:room.name,
                members:room.members.map((m: any) => ({
                    id: m._id,
                    name: m.name,
                    email: m.email,
                    initials: m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                })),
            }
        })    
        return null
    }
}
