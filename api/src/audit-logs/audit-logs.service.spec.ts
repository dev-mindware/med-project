import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

const mockAuditLog = {
  id: 'log-1',
  action: 'CREATE',
  entity: 'Entry',
  entityId: 'entry-1',
  status: 'SUCCESS',
  createdAt: new Date(),
  actorId: 'user-1',
  actor: { id: 'user-1', name: 'Test User', role: 'ADMIN' },
};

const mockPrismaService = {
  auditLog: {
    findMany: jest.fn().mockResolvedValue([mockAuditLog]),
    findUnique: jest.fn().mockResolvedValue(mockAuditLog),
  },
};

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    it('should return an array of audit logs with actor info', async () => {
      const result = await service.findAll({ skip: 0, take: 10 });
      expect(result).toEqual([mockAuditLog]);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { actor: expect.anything() },
        }),
      );
    });

    it('should use default orderBy if not provided', async () => {
      await service.findAll({});
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return a single audit log with actor info', async () => {
      const result = await service.findOne('log-1');
      expect(result).toEqual(mockAuditLog);
      expect(prisma.auditLog.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'log-1' },
          include: { actor: expect.anything() },
        }),
      );
    });

    it('should return null if log is not found', async () => {
      prisma.auditLog.findUnique.mockResolvedValueOnce(null);
      const result = await service.findOne('non-existent');
      expect(result).toBeNull();
    });
  });
});
