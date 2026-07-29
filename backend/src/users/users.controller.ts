import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as express from 'express'; // ← namespace import
import { SkipThrottle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
@SkipThrottle()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: express.Request) {
    return req.user; // { sub, email } — set by JwtStrategy.validate()
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  search(@Query('query') q: string, @Req() req: Request & { user: { sub: string } }) {
      return this.usersService.search(q, req.user?.sub);
  }

  @Post('update-password')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto, @Req() req: Request & { user: { sub: string } }) {
    return this.usersService.updatePassword(updatePasswordDto, req.user?.sub)
  }
}
