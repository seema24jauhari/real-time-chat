import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as express from 'express'; // ← namespace import
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from 'src/users/schemas/user.schema';
import { Document } from 'mongoose';

interface AuthRequest extends express.Request {
  user: {
    id: string;
    sub: {
      _id: string;
    };
    email: string;
    roles: string[];
  };
}

@Controller('auth')
@SkipThrottle()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
    @Req() req: express.Request,
  ) {
    return this.authService.login(loginDto.email, loginDto.password, res, req);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Req() req: express.Request) {
    return this.authService.refresh(req);
  }

  @Delete('logout')
  logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.logout(req, res);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport redirects to Google's consent screen — body never runs
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.handleOAuthLogin(req.user as User & Document, res);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.handleOAuthLogin(req.user as User & Document, res);
  }

  @Post('mfa/setup')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  setup(@Req() req: AuthRequest) {
    return this.authService.setupMfa(req.user.id);
  }

  @Post('mfa/login')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  verify(@Body() body: { code: string }, @Req() req: AuthRequest) {
    return this.authService.verifyMfaLogin(req.user.sub._id, body.code);
  }

  @Get('verify-token')
  @UseGuards(JwtAuthGuard)
  verifyToken(@Req() req: express.Request) {
    // If we reach here, JwtAuthGuard already verified the signature + expiry
    return {
      valid: true,
      user: req.user, // whatever your JwtStrategy.validate() returns
    };
  }

  @Post('forget-password')
  @HttpCode(200)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email)
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(
    @Body('token') token: string,
    @Body('password') password: string
  ) {
    return this.authService.resetPassword(token, password)
  }
}
