import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import type { AuthRequest } from '../auth/types/auth-request';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get global dashboard stats (Admin/Supervisor)' })
  @ApiResponse({ status: 200, type: DashboardStatsDto })
  getGlobalDashboard() {
    return this.statsService.getDashboardGlobal();
  }

  @Get('dashboard/me')
  @ApiOperation({ summary: 'Get stats for the current user' })
  @ApiResponse({ status: 200, type: DashboardStatsDto })
  getMeDashboard(@Request() req: AuthRequest) {
    return this.statsService.getUserDashboard(req.user.id, req.user.role);
  }

  @Get('dashboard/users/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get stats for a specific user (Admin/Supervisor)' })
  @ApiResponse({ status: 200, type: DashboardStatsDto })
  getUserDashboard(@Param('userId') userId: string) {
    return this.statsService.getUserDashboard(userId, UserRole.OPERATOR);
  }
}
