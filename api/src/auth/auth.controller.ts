import { Controller, Post, UseGuards, Request, Body, Get, Patch } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  async login(@Request() req: ExpressRequest & { user: User }) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        role: { type: 'string', example: 'OPERATOR' },
      },
      required: ['name', 'email', 'password'],
    },
  })
  async register(@Body() body: { name: string; email: string; password: string; role?: User['role'] }) {
    return this.authService.register(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'jwt-refresh-token' },
      },
      required: ['refreshToken'],
    },
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Request() req: ExpressRequest & { user: Pick<User, 'id'> }) {
    return this.authService.logout(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: ExpressRequest & { user: Pick<User, 'id'> }) {
    return this.authService.getProfile(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        profilePhotoUrl: { type: 'string' },
      },
    },
  })
  updateProfile(@Request() req: ExpressRequest & { user: Pick<User, 'id'> }, @Body() body: { name?: string; profilePhotoUrl?: string }) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('email')
  @ApiOperation({ summary: 'Update current user email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
      required: ['email'],
    },
  })
  updateEmail(@Request() req: ExpressRequest & { user: Pick<User, 'id'> }, @Body('email') email: string) {
    return this.authService.updateEmail(req.user.id, email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @ApiOperation({ summary: 'Update current user password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string' },
        newPassword: { type: 'string' },
      },
      required: ['currentPassword', 'newPassword'],
    },
  })
  updatePassword(@Request() req: ExpressRequest & { user: Pick<User, 'id'> }, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.updatePassword(req.user.id, body);
  }
}
