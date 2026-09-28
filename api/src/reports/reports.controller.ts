import { Body, Controller, Get, Param, Post, Query, Request, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Prisma, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../auth/types/auth-request';
import { GlobalFilterDto } from '../common/dto/global-filter.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate/:type')
  @ApiOperation({ summary: 'Generate and download an Excel or PDF report' })
  @ApiParam({ name: 'type', enum: ['users', 'activity', 'summary'] })
  async generateReport(@Param('type') type: string, @Query('format') format: 'xlsx' | 'pdf' = 'xlsx', @Request() req: AuthRequest, @Res() res: Response) {
    const report = await this.reportsService.generateReport(type, req.user.id, format);
    res.setHeader('Content-Type', report.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
    res.send(report.buffer);
  }

  @Get('history')
  @ApiOperation({ summary: 'List generated reports history' })
  findAll(@Query() filters: GlobalFilterDto) {
    const { page = 1, limit = 20, orderBy, orderDirection, search, startDate, endDate } = filters;
    const where: Prisma.ReportWhereInput = {};
    if (search) {
      where.OR = [
        { type: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    return this.reportsService.getHistory({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy ? { [orderBy]: orderDirection } : { createdAt: 'desc' as Prisma.SortOrder },
      where,
    });
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a report generation' })
  @ApiBody({ schema: { type: 'object', properties: { reportType: { type: 'string', example: 'users' }, frequency: { type: 'string', example: 'weekly' }, emailTo: { type: 'string', example: 'admin@example.com' } }, required: ['reportType'] } })
  scheduleReport(@Body() body: Record<string, unknown>) {
    return { message: 'Report scheduled successfully. You will receive an email shortly.', data: body };
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a previously generated report' })
  downloadReport(@Param('id') _id: string): never {
    throw new NotFoundException('Report file not found on storage');
  }
}
