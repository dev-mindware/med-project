import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { EventRegistrationsService } from './event-registrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, RegistrationStatus, Prisma } from '@prisma/client';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationFilterDto } from './dto/registration-filter.dto';

@ApiTags('event-registrations')
@Controller('event-registrations')
export class EventRegistrationsController {
  constructor(
    private readonly registrationsService: EventRegistrationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register for an event (Public)' })
  create(@Body() createDto: CreateRegistrationDto) {
    return this.registrationsService.create(createDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'List all registrations (Admin/Supervisor)' })
  findAll(@Query() filters: RegistrationFilterDto) {
    const {
      page = 1,
      limit = 20,
      orderBy,
      orderDirection,
      eventId,
      status,
      search,
      startDate,
      endDate,
    } = filters;
    const where: Prisma.EventRegistrationWhereInput = {};

    if (eventId) where.eventId = eventId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return this.registrationsService.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: orderBy
        ? { [orderBy]: orderDirection }
        : { createdAt: 'desc' as Prisma.SortOrder },
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get a specific registration details' })
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Update registration status and notify user by email',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
        },
        notes: {
          type: 'string',
          description: 'Optional notes/reason for rejection',
        },
      },
      required: ['status'],
    },
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RegistrationStatus,
    @Body('notes') notes?: string,
  ) {
    return this.registrationsService.updateStatus(id, status, notes);
  }

  @Patch(':id/attendance')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Mark attendance for an attendee' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        attended: { type: 'boolean' },
      },
      required: ['attended'],
    },
  })
  markAttendance(@Param('id') id: string, @Body('attended') attended: boolean) {
    return this.registrationsService.markAttendance(id, attended);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a registration' })
  remove(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
