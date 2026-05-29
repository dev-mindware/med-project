import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, NotFoundException, ForbiddenException, BadRequestException, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { AnthroponymsService } from './anthroponyms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApprovalStatus, Prisma } from '@prisma/client';
import { CreateAnthroponymDto } from './dto/create-anthroponym.dto';
import { UpdateAnthroponymDto } from './dto/update-anthroponym.dto';
import { LinguisticFilterDto } from '../common/dto/filter.dto';
import { UsersService } from '../users/users.service';
import { applySupervisorAnthroponymScope, ensureSupervisorCanAccessCreator } from '../common/supervisor-scope';
import { ImportRowsDto } from '../common/dto/import-rows.dto';

@ApiTags('anthroponyms')
@ApiBearerAuth()
@Controller('anthroponyms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnthroponymsController {
  constructor(
    private readonly anthroponymsService: AnthroponymsService,
    @Optional() private readonly usersService?: UsersService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new anthroponym' })
  create(@Request() req: any, @Body() createAnthroponymDto: CreateAnthroponymDto) {
    return this.anthroponymsService.create({
      ...createAnthroponymDto,
      createdBy: { connect: { id: req.user.id } },
      approvalStatus: ApprovalStatus.DRAFT,
    });
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Import anthroponyms in bulk' })
  import(@Request() req: any, @Body() importDto: ImportRowsDto) {
    return this.anthroponymsService.importRows(importDto.rows, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all anthroponyms' })
  findAll(@Request() req: any, @Query() filters?: LinguisticFilterDto) {
    if (!filters) {
      filters = req;
      req = { user: { id: '', role: UserRole.ADMIN } };
    }

    const { search, page = 1, limit = 20, orderBy, orderDirection, startDate, endDate, languageCode, ...rest } =
      filters as LinguisticFilterDto;
    const where: Prisma.AnthroponymWhereInput = { ...rest };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    applySupervisorAnthroponymScope(req.user, where);

    const params = {
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: orderBy ? { [orderBy]: orderDirection } : { createdAt: 'desc' as Prisma.SortOrder },
    };

    if (search) {
      return this.anthroponymsService.search(search, params);
    }
    return this.anthroponymsService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific anthroponym by ID' })
  async findOne(@Param('id') id: string, @Request() req: any = { user: { id: '', role: UserRole.ADMIN } }) {
    const anthroponym = await this.anthroponymsService.findOne({ id });
    if (!anthroponym) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR && anthroponym.createdById !== req.user.id) {
      throw new ForbiddenException('Unauthorized');
    }
    await ensureSupervisorCanAccessCreator(req.user, anthroponym.createdById, this.usersService);
    return anthroponym;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update an existing anthroponym' })
  async update(@Param('id') id: string, @Request() req: any, @Body() updateAnthroponymDto: UpdateAnthroponymDto) {
    const anthroponym = await this.anthroponymsService.findOne({ id });
    if (!anthroponym) throw new NotFoundException();
    
    if (req.user.role === UserRole.OPERATOR) {
      if (anthroponym.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (anthroponym.approvalStatus !== ApprovalStatus.DRAFT && anthroponym.approvalStatus !== ApprovalStatus.NEEDS_CORRECTION) {
        throw new ForbiddenException('Can only edit draft or correction-requested content');
      }
    }
    await ensureSupervisorCanAccessCreator(req.user, anthroponym.createdById, this.usersService);

    const data: Prisma.AnthroponymUpdateInput = {
      ...updateAnthroponymDto,
      updatedBy: { connect: { id: req.user.id } },
    };

    if (anthroponym.approvalStatus === ApprovalStatus.NEEDS_CORRECTION && anthroponym.createdById === req.user.id) {
      data.approvalStatus = ApprovalStatus.PENDING_APPROVAL;
      data.submittedAt = new Date();
    }

    return this.anthroponymsService.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Delete an anthroponym' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const anthroponym = await this.anthroponymsService.findOne({ id });
    if (!anthroponym) throw new NotFoundException();
    
    if (req.user.role === UserRole.OPERATOR) {
      if (anthroponym.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (anthroponym.approvalStatus !== ApprovalStatus.DRAFT) {
        throw new ForbiddenException('Can only delete draft content');
      }
    }

    return this.anthroponymsService.remove({ id });
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update anthroponym approval status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'ARCHIVED'],
          description: 'New approval status to set for the anthroponym'
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
    @Request() req: any,
    @Body('status') status: ApprovalStatus,
    @Body('reason') reason?: string
  ) {
    const item = await this.anthroponymsService.findOne({ id });
    if (!item) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR && item.createdById !== req.user.id) {
      throw new ForbiddenException('Unauthorized');
    }
    await ensureSupervisorCanAccessCreator(req.user, item.createdById, this.usersService);

    const data: Prisma.AnthroponymUpdateInput = { approvalStatus: status };

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

    return this.anthroponymsService.update({ where: { id }, data });
  }


  @Get(':id/schema')
  @ApiOperation({ summary: 'Generate GEO / JSON-LD Schema.org metadata for the anthroponym' })
  async generateSchema(@Param('id') id: string) {
    const item = await this.anthroponymsService.findOne({ id });
    if (!item) throw new NotFoundException();

    return {
      '@context': 'https://schema.org/',
      '@type': 'DefinedTerm',
      '@id': `https://api.med-api.com/anthroponyms/${item.id}`,
      name: item.name,
      description: item.meaning,
      inDefinedTermSet: 'https://med-api.com/anthroponyms',
      language: 'pt',
    };
  }
}
