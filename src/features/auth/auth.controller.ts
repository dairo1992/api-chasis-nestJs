import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import express from 'express';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  login(@Body() loginDto: LoginRequestDto, @Req() request: express.Request) {
    return this.authService.login(loginDto, request);
  }

  @Public()
  @Post('refresh-token')
  refreshToken(@Body() refreshToken: RefreshTokenRequestDto) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('logout')
  logout(@Req() request: Request) {
    return this.authService.logout(request.headers['session-id'] as string);
  }
}
