import { ForbiddenException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { UsersService } from '../users/users.service';

type AuthUser = {
  id: string;
  role: UserRole;
};

export function applySupervisorEntryScope(user: AuthUser, where: Prisma.EntryWhereInput) {
  if (user.role === UserRole.OPERATOR) {
    where.createdById = user.id;
  }

  if (user.role === UserRole.SUPERVISOR) {
    where.OR = [{ createdById: user.id }, { createdBy: { supervisorId: user.id } }];
  }
}

export function applySupervisorNeologismScope(user: AuthUser, where: Prisma.NeologismWhereInput) {
  if (user.role === UserRole.OPERATOR) {
    where.createdById = user.id;
  }

  if (user.role === UserRole.SUPERVISOR) {
    where.OR = [{ createdById: user.id }, { createdBy: { supervisorId: user.id } }];
  }
}

export function applySupervisorToponymScope(user: AuthUser, where: Prisma.ToponymWhereInput) {
  if (user.role === UserRole.OPERATOR) {
    where.createdById = user.id;
  }

  if (user.role === UserRole.SUPERVISOR) {
    where.OR = [{ createdById: user.id }, { createdBy: { supervisorId: user.id } }];
  }
}

export function applySupervisorAnthroponymScope(user: AuthUser, where: Prisma.AnthroponymWhereInput) {
  if (user.role === UserRole.OPERATOR) {
    where.createdById = user.id;
  }

  if (user.role === UserRole.SUPERVISOR) {
    where.OR = [{ createdById: user.id }, { createdBy: { supervisorId: user.id } }];
  }
}

export function applySupervisorForeignismScope(user: AuthUser, where: Prisma.ForeignismWhereInput) {
  if (user.role === UserRole.OPERATOR) {
    where.createdById = user.id;
  }

  if (user.role === UserRole.SUPERVISOR) {
    where.OR = [{ createdById: user.id }, { createdBy: { supervisorId: user.id } }];
  }
}

export async function ensureSupervisorCanAccessCreator(
  user: AuthUser,
  createdById: string | null,
  usersService?: UsersService,
) {
  if (user.role !== UserRole.SUPERVISOR || createdById === user.id) {
    return;
  }

  if (!usersService) {
    throw new ForbiddenException('Supervisor management scope is unavailable');
  }

  if (!createdById || !(await usersService.isOperatorManagedBySupervisor(user.id, createdById))) {
    throw new ForbiddenException('Supervisor can only manage assigned operators');
  }
}
