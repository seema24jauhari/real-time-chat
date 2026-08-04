import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { MessagesService } from 'src/messages/messages.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Post('dm')
  @HttpCode(200)
  createDM(
    @Req() req: Request & { user: { sub: string } },
    @Body('memberId') memberId: string,
  ) {
    return this.roomsService.findOrCreateDM(req.user?.sub, memberId);
  }

  @Post('recent/dms')
  @HttpCode(200)
  getRecentDms(@Req() req: Request & { user: { sub: string } }) {
    return this.roomsService.getRecentDms(req.user?.sub);
  }

  @Post('recent/channels')
  @HttpCode(200)
  getRecentChannels(@Req() req: Request & { user: { sub: string } }) {
    return this.roomsService.getRecentChannels(req.user?.sub);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  getMessages(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.findByRoom(id, cursor, limit);
  }

  @Get('unread-messages')
  @UseGuards(JwtAuthGuard)
  getUnreadMessages(
    @Req() req: Request & { user: { sub: string } }
  ) {
    return this.messagesService.unreadMessages(req.user?.sub);
  }
}
