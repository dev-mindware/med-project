import { Controller, Get, Param, Patch, Query, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRequest } from '../auth/types/auth-request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List current user notifications' })
  findAll(@Request() req: AuthRequest, @Query('limit') limit = '10', @Query('unreadOnly') unreadOnly?: string) {
    return this.notificationsService.findAll(req.user.id, {
      take: Number(limit) || 10,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get current user unread notifications count' })
  unreadCount(@Request() req: AuthRequest) {
    return this.notificationsService.unreadCount(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification detail' })
  async findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    const notification = await this.notificationsService.findOne(req.user.id, id);
    if (!notification) throw new NotFoundException('Notificação não encontrada');
    return notification;
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all current user notifications as read' })
  markAllAsRead(@Request() req: AuthRequest) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
