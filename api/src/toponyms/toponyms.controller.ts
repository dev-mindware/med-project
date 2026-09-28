import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, NotFoundException, ForbiddenException, BadRequestException, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ToponymsService } from './toponyms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApprovalStatus, Prisma } from '@prisma/client';
import { CreateToponymDto } from './dto/create-toponym.dto';
import { UpdateToponymDto } from './dto/update-toponym.dto';
import { LinguisticFilterDto } from '../common/dto/filter.dto';
import { UsersService } from '../users/users.service';
import { applySupervisorToponymScope, ensureSupervisorCanAccessCreator } from '../common/supervisor-scope';
import { ImportRowsDto } from '../common/dto/import-rows.dto';

import { AuthRequest } from '../auth/types/auth-request';
@ApiTags('toponyms')
@ApiBearerAuth()
@Controller('toponyms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ToponymsController {
  constructor(
    private readonly toponymsService: ToponymsService,
    @Optional() private readonly usersService?: UsersService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new toponym' })
  create(@Request() req: AuthRequest, @Body() createToponymDto: CreateToponymDto) {
    return this.toponymsService.create({
      ...createToponymDto,
      createdBy: { connect: { id: req.user.id } },
      approvalStatus: ApprovalStatus.DRAFT,
    });
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Import toponyms in bulk' })
  import(@Request() req: AuthRequest, @Body() importDto: ImportRowsDto) {
    return this.toponymsService.importRows(importDto.rows, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all toponyms' })
  findAll(@Request() req: AuthRequest, @Query() filters?: LinguisticFilterDto) {
    if (!filters) {
      filters = req;
      req = { user: { id: '', role: UserRole.ADMIN } };
    }

    const { search, page = 1, limit = 20, orderBy, orderDirection, startDate, endDate, ...rest } =
      filters as LinguisticFilterDto;
    const where: Prisma.ToponymWhereInput = { ...rest };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    applySupervisorToponymScope(req.user, where);

    const params = {
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: orderBy ? { [orderBy]: orderDirection } : { createdAt: 'desc' as Prisma.SortOrder },
    };

    if (search) {
      return this.toponymsService.search(search, params);
    }
    return this.toponymsService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific toponym by ID' })
  async findOne(@Param('id') id: string, @Request() req: AuthRequest = { user: { id: '', role: UserRole.ADMIN } }) {
    const toponym = await this.toponymsService.findOne({ id });
    if (!toponym) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR && toponym.createdById !== req.user.id) {
      throw new ForbiddenException('Unauthorized');
    }
    await ensureSupervisorCanAccessCreator(req.user, toponym.createdById, this.usersService);
    return toponym;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update an existing toponym' })
  async update(@Param('id') id: string, @Request() req: AuthRequest, @Body() updateToponymDto: UpdateToponymDto) {
    const toponym = await this.toponymsService.findOne({ id });
    if (!toponym) throw new NotFoundException();
    
    if (req.user.role === UserRole.OPERATOR) {
      if (toponym.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (toponym.approvalStatus !== ApprovalStatus.DRAFT && toponym.approvalStatus !== ApprovalStatus.NEEDS_CORRECTION) {
        throw new ForbiddenException('Can only edit draft or correction-requested content');
      }
    }
    await ensureSupervisorCanAccessCreator(req.user, toponym.createdById, this.usersService);

    const data: Prisma.ToponymUpdateInput = {
      ...updateToponymDto,
      updatedBy: { connect: { id: req.user.id } },
    };

    if (toponym.approvalStatus === ApprovalStatus.NEEDS_CORRECTION && toponym.createdById === req.user.id) {
      data.approvalStatus = ApprovalStatus.PENDING_APPROVAL;
      data.submittedAt = new Date();
    }

    return this.toponymsService.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Delete a toponym' })
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    const toponym = await this.toponymsService.findOne({ id });
    if (!toponym) throw new NotFoundException();
    
    if (req.user.role === UserRole.OPERATOR) {
      if (toponym.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (toponym.approvalStatus !== ApprovalStatus.DRAFT) {
        throw new ForbiddenException('Can only delete draft content');
      }
    }

    return this.toponymsService.remove({ id });
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update toponym approval status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'ARCHIVED'],
          description: 'New approval status to set for the toponym'
        },
        reason: { 
          type: 'string', 
          description: 'Optional reason or feedback, required for rejection or correction' 
        }
      },
      required: ['status']
    }
  })
  async review(
    @Param('id') id: string, 
    @Request() req: AuthRequest,
    @Body('status') status: ApprovalStatus,
    @Body('reason') reason?: string
  ) {
    const item = await this.toponymsService.findOne({ id });
    if (!item) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR && item.createdById !== req.user.id) {
      throw new ForbiddenException('Unauthorized');
    }
    await ensureSupervisorCanAccessCreator(req.user, item.createdById, this.usersService);

    const data: Prisma.ToponymUpdateInput = { approvalStatus: status };

    if (status === ApprovalStatus.PENDING_APPROVAL) {
      data.submittedAt = new Date();
    } else if (status === ApprovalStatus.APPROVED) {
      if (req.user.role === UserRole.OPERATOR) throw new ForbiddenException('Unauthorized');
      data.approvedAt = new Date();
      data.approvedBy = { connect: { id: req.user.id } };
    } else if (status === ApprovalStatus.REJECTED) {
      if (req.user.role === UserRole.OPERATOR) throw new ForbiddenException('Unauthorized');
      data.rejectedAt = new Date();
      data.rejectionReason = reason;
    } else if (status === ApprovalStatus.NEEDS_CORRECTION) {
      if (req.user.role === UserRole.OPERATOR) throw new ForbiddenException('Unauthorized');
      data.correctionNotes = reason;
    }

    return this.toponymsService.update({ where: { id }, data });
  }


  @Get(':id/schema')
  @ApiOperation({ summary: 'Generate GEO / JSON-LD Schema.org metadata for the toponym' })
  async generateSchema(@Param('id') id: string) {
    const item = await this.toponymsService.findOne({ id });
    if (!item) throw new NotFoundException();

    return {
      '@context': 'https://schema.org/',
      '@type': 'Place',
      '@id': `https://api.med-api.com/toponyms/${item.id}`,
      name: item.toponym,
      description: item.meaning,
      containedInPlace: item.province,
      inDefinedTermSet: 'https://med-api.com/toponyms',
    };
  }
}
