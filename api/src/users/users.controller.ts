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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { UserFilterDto } from './dto/user-filter.dto';
import { AssignSupervisorOperatorsDto } from './dto/assign-supervisor-operators.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

type CreateUserBody = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  isActive?: boolean;
  profilePhotoUrl?: string | null;
  supervisorId?: string | null;
};

type UpdateUserBody = Partial<Omit<CreateUserBody, 'password'>> & {
  password?: string;
};

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'List all users' })
  async findAll(
    @Query() filters: UserFilterDto,
    @CurrentUser() currentUser: { id: string; role: UserRole },
  ) {
    const {
      page = 1,
      limit = 20,
      orderBy,
      orderDirection,
      search,
      startDate,
      endDate,
      role,
      isActive,
    } = filters;

    const where: Prisma.UserWhereInput = {};

    // ✅ Se SUPERVISOR, restringir apenas aos seus operadores geridos
    if (currentUser.role === UserRole.SUPERVISOR) {
      const managedOperators = await this.usersService.listManagedOperators(
        currentUser.id,
      );
      const managedIds = managedOperators.map((op) => op.id);
      where.id = { in: managedIds };
    }

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

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined && isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [data, total] = await Promise.all([
      this.usersService.findAll({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy
          ? { [orderBy]: orderDirection }
          : { createdAt: 'desc' as Prisma.SortOrder },
        where,
      }),
      this.usersService.count(where),
    ]);

    return { data, total };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user by Admin' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Unique email address for the user',
        },
        password: {
          type: 'string',
          description: 'Strong password for authentication',
        },
        name: { type: 'string', description: 'Full name of the user' },
        role: {
          type: 'string',
          enum: ['ADMIN', 'SUPERVISOR', 'OPERATOR'],
          description:
            'User role: ADMIN (Full access), SUPERVISOR (Reviewer), OPERATOR (Data entry)',
        },
        isActive: {
          type: 'boolean',
          description: 'Enable or disable the user account',
          default: true,
        },
      },
      required: ['email', 'password', 'name'],
    },
  })
  async create(@Body() createData: CreateUserBody) {
    const { password, ...userData } = createData;
    const passwordHash = await argon2.hash(password);

    return this.usersService.create({
      ...userData,
      passwordHash,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        name: { type: 'string' },
        role: {
          type: 'string',
          enum: ['ADMIN', 'SUPERVISOR', 'OPERATOR'],
          description:
            'User role: ADMIN (Full access), SUPERVISOR (Reviewer), OPERATOR (Data entry)',
        },
        isActive: { type: 'boolean' },
      },
    },
  })
  async update(@Param('id') id: string, @Body() updateData: UpdateUserBody) {
    const { password, ...userData } = updateData;
    const data: Prisma.UserUpdateInput = { ...userData };

    if (password) {
      data.passwordHash = await argon2.hash(password);
    }

    return this.usersService.update(id, data);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Change user role' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['ADMIN', 'SUPERVISOR', 'OPERATOR'],
          description: 'New role for the user: ADMIN, SUPERVISOR, or OPERATOR',
        },
      },
      required: ['role'],
    },
  })
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.update(id, { role });
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user active status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean' },
      },
      required: ['isActive'],
    },
  })
  updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.update(id, { isActive });
  }

  @Get(':id/operators')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List operators managed by a supervisor' })
  listManagedOperators(@Param('id') id: string) {
    return this.usersService.listManagedOperators(id);
  }

  @Patch(':id/operators')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Define which operators are managed by a supervisor',
  })
  @ApiBody({ type: AssignSupervisorOperatorsDto })
  assignManagedOperators(
    @Param('id') id: string,
    @Body() assignSupervisorOperatorsDto: AssignSupervisorOperatorsDto,
  ) {
    return this.usersService.assignOperatorsToSupervisor(
      id,
      assignSupervisorOperatorsDto.operatorIds,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
