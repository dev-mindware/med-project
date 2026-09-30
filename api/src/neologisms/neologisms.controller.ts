import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Optional,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApprovalStatus, Prisma, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ImportRowsDto } from '../common/dto/import-rows.dto';
import { LinguisticFilterDto } from '../common/dto/filter.dto';
import {
  applySupervisorNeologismScope,
  ensureSupervisorCanAccessCreator,
} from '../common/supervisor-scope';
import { UsersService } from '../users/users.service';
import { CreateNeologismDto } from './dto/create-neologism.dto';
import { UpdateNeologismDto } from './dto/update-neologism.dto';
import { NeologismsService } from './neologisms.service';

import { AuthRequest } from '../auth/types/auth-request';
@ApiTags('neologisms')
@ApiBearerAuth()
@Controller('neologisms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NeologismsController {
  constructor(
    private readonly neologismsService: NeologismsService,
    @Optional() private readonly usersService?: UsersService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new neologism' })
  create(
    @Request() req: AuthRequest,
    @Body() createNeologismDto: CreateNeologismDto,
  ) {
    return this.neologismsService.create({
      ...createNeologismDto,
      createdBy: { connect: { id: req.user.id } },
      approvalStatus: ApprovalStatus.DRAFT,
    });
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Import neologisms in bulk' })
  import(@Request() req: AuthRequest, @Body() importDto: ImportRowsDto) {
    return this.neologismsService.importRows(importDto.rows, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all neologisms' })
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
    } = filters;
    const where: Prisma.NeologismWhereInput = { ...rest };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    applySupervisorNeologismScope(reqUser, where);

    const params = {
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: orderBy
        ? { [orderBy]: orderDirection }
        : { createdAt: 'desc' as Prisma.SortOrder },
    };

    if (search) {
      return this.neologismsService.search(search, params);
    }
    return this.neologismsService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific neologism by ID' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any = { user: { id: '', role: UserRole.ADMIN } },
  ) {
    const neologism = await this.neologismsService.findOne({ id });
    if (!neologism) throw new NotFoundException();

    const currentUser = req?.user || { id: '', role: UserRole.ADMIN };
    if (
      currentUser.role === UserRole.OPERATOR &&
      neologism.createdById !== currentUser.id
    ) {
      throw new ForbiddenException('Unauthorized');
    }
    await ensureSupervisorCanAccessCreator(
      currentUser,
      neologism.createdById,
      this.usersService,
    );
    return neologism;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update an existing neologism' })
  async update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() updateNeologismDto: UpdateNeologismDto,
  ) {
    const neologism = await this.neologismsService.findOne({ id });
    if (!neologism) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR) {
      if (neologism.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (
        neologism.approvalStatus !== ApprovalStatus.DRAFT &&
        neologism.approvalStatus !== ApprovalStatus.NEEDS_CORRECTION
      ) {
        throw new ForbiddenException(
          'Can only edit draft or correction-requested content',
        );
      }
    }
    await ensureSupervisorCanAccessCreator(
      req.user,
      neologism.createdById,
      this.usersService,
    );

    const data: Prisma.NeologismUpdateInput = {
      ...updateNeologismDto,
      updatedBy: { connect: { id: req.user.id } },
    };

    if (
      neologism.approvalStatus === ApprovalStatus.NEEDS_CORRECTION &&
      neologism.createdById === req.user.id
    ) {
      data.approvalStatus = ApprovalStatus.PENDING_APPROVAL;
      data.submittedAt = new Date();
    }

    return this.neologismsService.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Delete a neologism' })
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    const neologism = await this.neologismsService.findOne({ id });
    if (!neologism) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR) {
      if (neologism.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (neologism.approvalStatus !== ApprovalStatus.DRAFT) {
        throw new ForbiddenException('Can only delete draft content');
      }
    }

    return this.neologismsService.remove({ id });
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update neologism approval status' })
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
          description: 'New approval status to set for the neologism',
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
    const item = await this.neologismsService.findOne({ id });
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

    const data: Prisma.NeologismUpdateInput = { approvalStatus: status };

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

    return this.neologismsService.update({ where: { id }, data });
  }

  @Get(':id/schema')
  @ApiOperation({
    summary: 'Generate GEO / JSON-LD Schema.org metadata for the neologism',
  })
  async generateSchema(@Param('id') id: string) {
    const neologism = await this.neologismsService.findOne({ id });
    if (!neologism) throw new NotFoundException();

    return {
      '@context': 'https://schema.org/',
      '@type': 'DefinedTerm',
      '@id': `https://api.med-api.com/neologisms/${neologism.id}`,
      name: neologism.entry,
      description: neologism.firstDefinition,
      inDefinedTermSet: 'https://med-api.com/neologisms',
      termCode: neologism.abbreviation || neologism.acronym,
      language: neologism.languageCode || 'pt',
    };
  }
}
