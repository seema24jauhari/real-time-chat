import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as express from 'express'; // ← namespace import
import { SkipThrottle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { UpdateProfileDto } from './dto/profile.dto';
import { ConfigService } from '@nestjs/config';

@Controller('users')
@SkipThrottle()
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly configService: ConfigService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: { sub: string } }) {
    return this.usersService.findById(req.user?.sub)
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  search(
    @Query('query') q: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.usersService.search(q, req.user?.sub);
  }

  @Post('update-password')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.usersService.updatePassword(updatePasswordDto, req.user?.sub);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
    const avatarUrl = file ? `${baseUrl}/uploads/avatars/${file.filename}` : undefined
    return this.usersService.updateProfile(req.user.sub, dto.name, avatarUrl);
  }
}
