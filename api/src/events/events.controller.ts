import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, EventStatus, Prisma } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsFilterDto, EventPeriod } from './dto/events-filter.dto';
import { GlobalFilterDto } from '../common/dto/global-filter.dto';

import { AuthRequest } from '../auth/types/auth-request';
@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new event' })
  create(@Request() req: AuthRequest, @Body() createDto: CreateEventDto) {
    return this.eventsService.create({
      ...createDto,
      createdBy: { connect: { id: req.user.id } },
    });
  }

  @Get()
  @ApiOperation({ summary: 'List events for authenticated users' })
  findAll(@Request() req: AuthRequest, @Query() filters: EventsFilterDto) {
    const {
      page = 1,
      limit = 20,
      orderBy,
      orderDirection,
      period,
      category,
      status,
      search,
      startDate,
      endDate,
    } = filters;
    const where: Prisma.EventWhereInput = {};

    if (req.user?.role === UserRole.ADMIN && status) {
      where.status = status;
    }

    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const now = new Date();
    if (period === EventPeriod.UPCOMING) {
      where.startDate = { gt: now };
    } else if (period === EventPeriod.ONGOING) {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else if (period === EventPeriod.PAST) {
      where.endDate = { lt: now };
    }

    return this.eventsService.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: orderBy
        ? { [orderBy]: orderDirection }
        : { startDate: 'asc' as Prisma.SortOrder },
    });
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a specific event by ID or slug' })
  async findOne(
    @Request() req: AuthRequest,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    const event = await this.eventsService.findOne(idOrSlug);
    if (!event) throw new NotFoundException();

    return event;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an event' })
  update(@Param('id') id: string, @Body() updateDto: UpdateEventDto) {
    return this.eventsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an event' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Change event status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
        },
        reason: { type: 'string', description: 'Reason for cancellation' },
      },
      required: ['status'],
    },
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EventStatus,
    @Body('reason') reason?: string,
  ) {
    const data: Prisma.EventUpdateInput = { status };
    if (status === EventStatus.PUBLISHED) {
      data.publishedAt = new Date();
    } else if (status === EventStatus.CANCELLED) {
      data.cancelledAt = new Date();
      data.cancellationReason = reason;
    }
    return this.eventsService.update(id, data);
  }
}
