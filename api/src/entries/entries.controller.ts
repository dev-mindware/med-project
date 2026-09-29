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
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApprovalStatus, Prisma } from '@prisma/client';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { LinguisticFilterDto } from '../common/dto/filter.dto';
import { UsersService } from '../users/users.service';
import {
  applySupervisorEntryScope,
  ensureSupervisorCanAccessCreator,
} from '../common/supervisor-scope';
import { ImportRowsDto } from '../common/dto/import-rows.dto';

import { AuthRequest } from '../auth/types/auth-request';
@ApiTags('entries')
@ApiBearerAuth()
@Controller('entries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntriesController {
  constructor(
    private readonly entriesService: EntriesService,
    @Optional() private readonly usersService?: UsersService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new linguistic entry' })
  create(@Request() req: AuthRequest, @Body() createEntryDto: CreateEntryDto) {
    return this.entriesService.create({
      ...createEntryDto,
      createdBy: { connect: { id: req.user.id } },
      approvalStatus: ApprovalStatus.DRAFT,
    });
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Import linguistic entries in bulk' })
  import(@Request() req: AuthRequest, @Body() importDto: ImportRowsDto) {
    return this.entriesService.importRows(importDto.rows, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all entries' })
  findAll(
    @Request() reqOrFilters: any,
    @Query() maybeFilters?: LinguisticFilterDto,
  ) {
    let reqUser: { id: string; role: UserRole; email?: string } = {
      id: '',
      role: UserRole.ADMIN,
      email: '',
    };
    let filters: LinguisticFilterDto = {};

    if (reqOrFilters && 'user' in reqOrFilters && reqOrFilters.user) {
      reqUser = reqOrFilters.user;
      filters = maybeFilters || {};
    } else if (reqOrFilters) {
      filters = reqOrFilters as LinguisticFilterDto;
    }

    const {
      search,
      page = 1,
      limit = 20,
      orderBy,
      orderDirection,
      startDate,
      endDate,
      ...rest
    } = filters as LinguisticFilterDto;
    const where: Prisma.EntryWhereInput = { ...rest };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    applySupervisorEntryScope(reqUser as any, where);

    const params = {
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: orderBy
        ? { [orderBy]: orderDirection }
        : { createdAt: 'desc' as Prisma.SortOrder },
    };

    if (search) {
      return this.entriesService.search(search, params);
    }
    return this.entriesService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific entry by ID' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any = { user: { id: '', role: UserRole.ADMIN } },
  ) {
    const entry = await this.entriesService.findOne({ id });
    if (!entry) throw new NotFoundException();

    const currentUser = req?.user || { id: '', role: UserRole.ADMIN };
    if (
      currentUser.role === UserRole.OPERATOR &&
      entry.createdById !== currentUser.id
    ) {
      throw new ForbiddenException('Unauthorized');
    }
    await ensureSupervisorCanAccessCreator(
      currentUser,
      entry.createdById,
      this.usersService,
    );
    return entry;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update an existing entry' })
  async update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() updateEntryDto: UpdateEntryDto,
  ) {
    const entry = await this.entriesService.findOne({ id });
    if (!entry) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR) {
      if (entry.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (
        entry.approvalStatus !== ApprovalStatus.DRAFT &&
        entry.approvalStatus !== ApprovalStatus.NEEDS_CORRECTION
      ) {
        throw new ForbiddenException(
          'Can only edit draft or correction-requested content',
        );
      }
    }
    await ensureSupervisorCanAccessCreator(
      req.user,
      entry.createdById,
      this.usersService,
    );

    const data: Prisma.EntryUpdateInput = {
      ...updateEntryDto,
      updatedBy: { connect: { id: req.user.id } },
    };

    if (
      entry.approvalStatus === ApprovalStatus.NEEDS_CORRECTION &&
      entry.createdById === req.user.id
    ) {
      data.approvalStatus = ApprovalStatus.PENDING_APPROVAL;
      data.submittedAt = new Date();
    }

    return this.entriesService.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Delete an entry' })
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    const entry = await this.entriesService.findOne({ id });
    if (!entry) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR) {
      if (entry.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (entry.approvalStatus !== ApprovalStatus.DRAFT) {
        throw new ForbiddenException('Can only delete draft content');
      }
    }

    return this.entriesService.remove({ id });
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({
    summary: 'Update entry approval status (submit, approve, reject, correct)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'DRAFT',
            'PENDING_APPROVAL',
            'APPROVED',
            'REJECTED',
            'NEEDS_CORRECTION',
            'ARCHIVED',
          ],
          description: 'New approval status to set for the entry',
        },
        reason: {
          type: 'string',
          description:
            'Optional reason or feedback, required for rejection or correction',
        },
      },
      required: ['status'],
    },
  })
  async review(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body('status') status: ApprovalStatus,
    @Body('reason') reason?: string,
  ) {
    const item = await this.entriesService.findOne({ id });
    if (!item) throw new NotFoundException();

    if (
      req.user.role === UserRole.OPERATOR &&
      item.createdById !== req.user.id
    ) {
      throw new ForbiddenException('Unauthorized');
    }
    await ensureSupervisorCanAccessCreator(
      req.user,
      item.createdById,
      this.usersService,
    );

    const data: Prisma.EntryUpdateInput = { approvalStatus: status };

    if (status === ApprovalStatus.PENDING_APPROVAL) {
      data.submittedAt = new Date();
    } else if (status === ApprovalStatus.APPROVED) {
      if (req.user.role === UserRole.OPERATOR)
        throw new ForbiddenException('Operators cannot approve');
      data.approvedAt = new Date();
      data.approvedBy = { connect: { id: req.user.id } };
    } else if (status === ApprovalStatus.REJECTED) {
      if (req.user.role === UserRole.OPERATOR)
        throw new ForbiddenException('Operators cannot reject');
      data.rejectedAt = new Date();
      data.rejectionReason = reason;
    } else if (status === ApprovalStatus.NEEDS_CORRECTION) {
      if (req.user.role === UserRole.OPERATOR)
        throw new ForbiddenException('Operators cannot request correction');
      data.correctionNotes = reason;
    }

    return this.entriesService.update({ where: { id }, data });
  }

  @Get(':id/schema')
  @ApiOperation({
    summary: 'Generate GEO / JSON-LD Schema.org metadata for the entry',
  })
  async generateSchema(@Param('id') id: string) {
    const entry = await this.entriesService.findOne({ id });
    if (!entry) throw new NotFoundException();

    return {
      '@context': 'https://schema.org/',
      '@type': 'DefinedTerm',
      '@id': `https://api.med-api.com/entries/${entry.id}`,
      name: entry.entry,
      description: entry.firstDefinition,
      inDefinedTermSet: 'https://med-api.com/dictionary',
      termCode: entry.abbreviation || entry.acronym,
      language: 'pt',
    };
  }
}
