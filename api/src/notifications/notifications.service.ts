import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
  entity?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
};

const publicNotificationSelect = {
  id: true,
  userId: true,
  title: true,
  message: true,
  readAt: true,
  createdAt: true,
};

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, params: { skip?: number; take?: number; unreadOnly?: boolean }) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(params.unreadOnly ? { readAt: null } : {}),
      },
      skip: params.skip,
      take: params.take,
      select: publicNotificationSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.notification.findFirst({
      where: { id, userId },
      select: publicNotificationSelect,
    });
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  markAsRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  create(data: CreateNotificationInput) {
    return this.prisma.notification.create({ data });
  }

  async createForRoles(roles: UserRole[], data: Omit<CreateNotificationInput, 'userId'>) {
    const users = await this.prisma.user.findMany({
      where: { role: { in: roles }, isActive: true },
      select: { id: true },
    });

    if (users.length === 0) return { count: 0 };

    return this.prisma.notification.createMany({
      data: users.map((user) => ({ ...data, userId: user.id })),
    });
  }
}
