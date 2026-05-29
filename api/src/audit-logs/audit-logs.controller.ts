import { Controller, Get, Param, Query, UseGuards, NotFoundException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, Prisma } from '@prisma/client';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import type { Response } from 'express';

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List all audit logs' })
  findAll(@Query() filters: AuditLogFilterDto) {
    const { actorId, action, entity, startDate, endDate, from, to, page = 1, limit = 20, orderBy, orderDirection, search } = filters;
    const where: Prisma.AuditLogWhereInput = {};
    const dateStart = startDate || from;
    const dateEnd = endDate || to;

    if (actorId) where.actorId = actorId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    
    if (dateStart || dateEnd) {
      where.createdAt = {};
      if (dateStart) where.createdAt.gte = new Date(dateStart);
      if (dateEnd) where.createdAt.lte = new Date(dateEnd);
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.auditLogsService.findAll({ 
      skip: (page - 1) * limit, 
      take: limit, 
      where,
      orderBy: orderBy ? { [orderBy]: orderDirection } : { createdAt: 'desc' as Prisma.SortOrder },
    });
  }

  @Get('report/pdf')
  @ApiOperation({ summary: 'Generate audit logs PDF report by period' })
  @ApiQuery({ name: 'period', enum: ['daily', 'monthly', 'annual'], required: false })
  @ApiQuery({ name: 'date', required: false, description: 'Reference date in YYYY-MM-DD format' })
  async generatePdfReport(
    @Query('period') period: 'daily' | 'monthly' | 'annual' = 'daily',
    @Query('date') date: string | undefined,
    @Res() res: Response,
  ) {
    const report = await this.auditLogsService.generatePdfReport(period, date ? new Date(date) : new Date());
    res.setHeader('Content-Type', report.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
    res.send(report.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific audit log by ID' })
  async findOne(@Param('id') id: string) {
    const log = await this.auditLogsService.findOne(id);
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }
}
