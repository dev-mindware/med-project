import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

const mockPrismaService = {
  user: {
    findUnique: jest.fn((args?: any) => {
      if (args?.where?.id === 'user-2') {
        return Promise.resolve({
          name: 'Operador Dois',
          role: 'OPERATOR',
          isActive: true,
        });
      }

      return Promise.resolve({
        name: 'Operador Teste',
        role: 'OPERATOR',
        isActive: true,
      });
    }),
    count: jest.fn((args?: any) => {
      if (!args) return Promise.resolve(10);
      if (args?.where?.isActive === true) return Promise.resolve(8);
      if (args?.where?.role === 'ADMIN') return Promise.resolve(2);
      if (args?.where?.role === 'SUPERVISOR') return Promise.resolve(3);
      if (args?.where?.role === 'OPERATOR') return Promise.resolve(5);
      return Promise.resolve(0);
    }),
  },
  entry: {
    findMany: jest.fn().mockResolvedValue([]),
    groupBy: jest
      .fn()
      .mockResolvedValue([{ createdById: 'user-1', _count: { _all: 3 } }]),
    count: jest.fn((args?: any) => {
      if (!args) return Promise.resolve(50);
      if (args?.where?.approvalStatus === 'PENDING_APPROVAL')
        return Promise.resolve(5);
      if (args?.where?.approvalStatus === 'APPROVED')
        return Promise.resolve(40);
      if (args?.where?.createdById) return Promise.resolve(20);
      return Promise.resolve(0);
    }),
  },
  anthroponym: {
    count: jest.fn().mockResolvedValue(30),
    findMany: jest.fn().mockResolvedValue([]),
    groupBy: jest
      .fn()
      .mockResolvedValue([{ createdById: 'user-1', _count: { _all: 2 } }]),
  },
  toponym: {
    count: jest.fn().mockResolvedValue(20),
    findMany: jest.fn().mockResolvedValue([]),
    groupBy: jest
      .fn()
      .mockResolvedValue([{ createdById: 'user-2', _count: { _all: 4 } }]),
  },
  foreignism: {
    count: jest.fn().mockResolvedValue(15),
    findMany: jest.fn().mockResolvedValue([]),
    groupBy: jest
      .fn()
      .mockResolvedValue([{ createdById: 'user-1', _count: { _all: 1 } }]),
  },
  neologism: {
    count: jest.fn().mockResolvedValue(7),
    findMany: jest.fn().mockResolvedValue([]),
    groupBy: jest
      .fn()
      .mockResolvedValue([{ createdById: 'user-2', _count: { _all: 3 } }]),
  },
  blogPost: {
    count: jest.fn((args?: any) => {
      if (!args) return Promise.resolve(12);
      if (args?.where?.status === 'PUBLISHED') return Promise.resolve(8);
      if (args?.where?.status === 'DRAFT') return Promise.resolve(4);
      return Promise.resolve(0);
    }),
  },
  event: {
    count: jest.fn((args?: any) => {
      if (!args) return Promise.resolve(6);
      if (args?.where?.startDate?.gt) return Promise.resolve(3);
      if (args?.where?.endDate?.gte) return Promise.resolve(1);
      return Promise.resolve(0);
    }),
  },
};

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    jest.clearAllMocks();
  });

  describe('getDashboardGlobal()', () => {
    it('should return all four stats categories', async () => {
      const result = await service.getDashboardGlobal();
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('blog');
      expect(result).toHaveProperty('events');
    });

    it('users.inactive should equal total minus active', async () => {
      const result = await service.getDashboardGlobal();
      expect(result.users.inactive).toBe(
        result.users.total - result.users.active,
      );
    });

    it('content.total should be sum of all linguistic types', async () => {
      const result = await service.getDashboardGlobal();
      const expected =
        result.content.entries +
        result.content.anthroponyms +
        result.content.toponyms +
        result.content.foreignisms +
        result.content.neologisms;
      expect(result.content.total).toBe(expected);
    });

    it('blog stats should have published and drafts fields', async () => {
      const result = await service.getDashboardGlobal();
      expect(result.blog).toHaveProperty('published');
      expect(result.blog).toHaveProperty('drafts');
    });

    it('events stats should include upcoming, ongoing, and past', async () => {
      const result = await service.getDashboardGlobal();
      expect(result.events).toHaveProperty('upcoming');
      expect(result.events).toHaveProperty('ongoing');
      expect(result.events).toHaveProperty('past');
    });

    it('topContributors should aggregate records from all linguistic modules', async () => {
      const result = await service.getDashboardGlobal();
      expect(result.topContributors[0]).toMatchObject({
        name: 'Operador Dois',
        count: 7,
      });
      expect(result.topContributors[1]).toMatchObject({
        name: 'Operador Teste',
        count: 6,
      });
    });
  });

  describe('getUserDashboard()', () => {
    it('should return global stats for ADMIN role', async () => {
      const result = await service.getUserDashboard(
        'user-uuid-1',
        UserRole.ADMIN,
      );
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('content');
    });

    it('should return personal stats for OPERATOR role', async () => {
      const result = (await service.getUserDashboard(
        'user-uuid-op',
        UserRole.OPERATOR,
      )) as any;
      expect(result).toHaveProperty('cards');
      expect(result).toHaveProperty('charts');
      expect(result).toHaveProperty('recentActivity');
      expect(result).toHaveProperty('topContributors');
      expect(result.summary).toHaveProperty('content');
    });
  });
});
