import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}
    
    @Post('dm')
    @HttpCode(200)
    createDM(@Req() req: Request & { user: { sub: string } }, @Body('memberId') memberId: string) {
        return this.roomsService.findOrCreateDM(req.user?.sub, memberId)
    }

    @Post('recent/dms')
    @HttpCode(200)
    getRecentDms(@Req() req: Request & { user: { sub: string } }) {
        return this.roomsService.getRecentDms(req.user?.sub)
    }

    @Post('recent/channels')
    @HttpCode(200)
    getRecentChannels(@Req() req: Request & { user: { sub: string } }) {
        return this.roomsService.getRecentChannels(req.user?.sub)
    }
}
