import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return this.prisma.user.findMany(params);
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async listManagedOperators(supervisorId: string) {
    await this.ensureSupervisor(supervisorId);

    return this.prisma.user.findMany({
      where: { role: UserRole.OPERATOR, supervisorId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        supervisorId: true,
      },
    });
  }

  async assignOperatorsToSupervisor(supervisorId: string, operatorIds: string[]) {
    await this.ensureSupervisor(supervisorId);
    await this.ensureOperators(operatorIds);

    return this.prisma.user.update({
      where: { id: supervisorId },
      data: {
        managedOperators: {
          set: operatorIds.map((id) => ({ id })),
        },
      },
      include: {
        managedOperators: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async isOperatorManagedBySupervisor(supervisorId: string, operatorId: string): Promise<boolean> {
    const operator = await this.prisma.user.findFirst({
      where: {
        id: operatorId,
        role: UserRole.OPERATOR,
        supervisorId,
      },
      select: { id: true },
    });

    return Boolean(operator);
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  private async ensureSupervisor(supervisorId: string) {
    const supervisor = await this.prisma.user.findUnique({
      where: { id: supervisorId },
      select: { id: true, role: true },
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    if (supervisor.role !== UserRole.SUPERVISOR) {
      throw new BadRequestException('Selected user must have SUPERVISOR role');
    }
  }

  private async ensureOperators(operatorIds: string[]) {
    if (operatorIds.length === 0) {
      return;
    }

    const operators = await this.prisma.user.findMany({
      where: { id: { in: operatorIds } },
      select: { id: true, role: true },
    });

    if (operators.length !== operatorIds.length) {
      throw new BadRequestException('One or more operators were not found');
    }

    if (operators.some((operator) => operator.role !== UserRole.OPERATOR)) {
      throw new BadRequestException('Only users with OPERATOR role can be assigned to a supervisor');
    }
  }
}
