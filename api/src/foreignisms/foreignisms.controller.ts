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
import { ForeignismsService } from './foreignisms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApprovalStatus, Prisma } from '@prisma/client';
import { CreateForeignismDto } from './dto/create-foreignism.dto';
import { UpdateForeignismDto } from './dto/update-foreignism.dto';
import { LinguisticFilterDto } from '../common/dto/filter.dto';
import { UsersService } from '../users/users.service';
import {
  applySupervisorForeignismScope,
  ensureSupervisorCanAccessCreator,
} from '../common/supervisor-scope';
import { ImportRowsDto } from '../common/dto/import-rows.dto';

import { AuthRequest } from '../auth/types/auth-request';
@ApiTags('foreignisms')
@ApiBearerAuth()
@Controller('foreignisms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ForeignismsController {
  constructor(
    private readonly foreignismsService: ForeignismsService,
    @Optional() private readonly usersService?: UsersService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new foreignism' })
  create(
    @Request() req: AuthRequest,
    @Body() createForeignismDto: CreateForeignismDto,
  ) {
    return this.foreignismsService.create({
      ...createForeignismDto,
      createdBy: { connect: { id: req.user.id } },
      approvalStatus: ApprovalStatus.DRAFT,
    });
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Import foreignisms in bulk' })
  import(@Request() req: AuthRequest, @Body() importDto: ImportRowsDto) {
    return this.foreignismsService.importRows(importDto.rows, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all foreignisms' })
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
      languageCode,
      ...rest
    } = filters;
    const where: Prisma.ForeignismWhereInput = { ...rest };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    applySupervisorForeignismScope(reqUser, where);

    const params = {
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: orderBy
        ? { [orderBy]: orderDirection }
        : { createdAt: 'desc' as Prisma.SortOrder },
    };

    if (search) {
      return this.foreignismsService.search(search, params);
    }
    return this.foreignismsService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific foreignism by ID' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any = { user: { id: '', role: UserRole.ADMIN } },
  ) {
    const foreignism = await this.foreignismsService.findOne({ id });
    if (!foreignism) throw new NotFoundException();

    const currentUser = req?.user || { id: '', role: UserRole.ADMIN };
    if (
      currentUser.role === UserRole.OPERATOR &&
      foreignism.createdById !== currentUser.id
    ) {
      throw new ForbiddenException('Unauthorized');
    }
    await ensureSupervisorCanAccessCreator(
      currentUser,
      foreignism.createdById,
      this.usersService,
    );
    return foreignism;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update an existing foreignism' })
  async update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() updateForeignismDto: UpdateForeignismDto,
  ) {
    const foreignism = await this.foreignismsService.findOne({ id });
    if (!foreignism) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR) {
      if (foreignism.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (
        foreignism.approvalStatus !== ApprovalStatus.DRAFT &&
        foreignism.approvalStatus !== ApprovalStatus.NEEDS_CORRECTION
      ) {
        throw new ForbiddenException(
          'Can only edit draft or correction-requested content',
        );
      }
    }
    await ensureSupervisorCanAccessCreator(
      req.user,
      foreignism.createdById,
      this.usersService,
    );

    const data: Prisma.ForeignismUpdateInput = {
      ...updateForeignismDto,
      updatedBy: { connect: { id: req.user.id } },
    };

    if (
      foreignism.approvalStatus === ApprovalStatus.NEEDS_CORRECTION &&
      foreignism.createdById === req.user.id
    ) {
      data.approvalStatus = ApprovalStatus.PENDING_APPROVAL;
      data.submittedAt = new Date();
    }

    return this.foreignismsService.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Delete a foreignism' })
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    const foreignism = await this.foreignismsService.findOne({ id });
    if (!foreignism) throw new NotFoundException();

    if (req.user.role === UserRole.OPERATOR) {
      if (foreignism.createdById !== req.user.id) {
        throw new ForbiddenException('Unauthorized');
      }
      if (foreignism.approvalStatus !== ApprovalStatus.DRAFT) {
        throw new ForbiddenException('Can only delete draft content');
      }
    }

    return this.foreignismsService.remove({ id });
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update foreignism approval status' })
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
          description: 'New approval status to set for the foreignism',
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
    const item = await this.foreignismsService.findOne({ id });
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

    const data: Prisma.ForeignismUpdateInput = { approvalStatus: status };

    if (status === ApprovalStatus.PENDING_APPROVAL) {
      data.submittedAt = new Date();
    } else if (status === ApprovalStatus.APPROVED) {
      if (req.user.role === UserRole.OPERATOR)
        throw new ForbiddenException('Unauthorized');
      data.approvedAt = new Date();
      data.approvedBy = { connect: { id: req.user.id } };
    } else if (status === ApprovalStatus.REJECTED) {
      if (req.user.role === UserRole.OPERATOR)
        throw new ForbiddenException('Unauthorized');
      data.rejectedAt = new Date();
      data.rejectionReason = reason;
    } else if (status === ApprovalStatus.NEEDS_CORRECTION) {
      if (req.user.role === UserRole.OPERATOR)
        throw new ForbiddenException('Unauthorized');
      data.correctionNotes = reason;
    }

    return this.foreignismsService.update({ where: { id }, data });
  }
}
