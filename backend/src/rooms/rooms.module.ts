  import { Module } from '@nestjs/common'
  import { MongooseModule } from '@nestjs/mongoose'
  import { Room, RoomSchema } from './schemas/room.schema'
  import { RoomsService } from './rooms.service'
  import { RoomsController } from './rooms.controller'
import { MessagesModule } from 'src/messages/messages.module'

  @Module({
    imports: [
      MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
      MessagesModule
    ],
    providers: [RoomsService],
    controllers: [RoomsController],
    exports: [RoomsService], // export so gateway can use it
  })
  export class RoomsModule {
    constructor(private roomsService: RoomsService) {}

    async onModuleInit(){
        await this.roomsService.seedDefaultChannels()
    }
  }