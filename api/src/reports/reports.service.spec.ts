import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

const mockPrismaService = {
  user: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
  auditLog: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
  entry: { count: jest.fn().mockResolvedValue(0) },
  neologism: { count: jest.fn().mockResolvedValue(0) },
  toponym: { count: jest.fn().mockResolvedValue(0) },
  anthroponym: { count: jest.fn().mockResolvedValue(0) },
  foreignism: { count: jest.fn().mockResolvedValue(0) },
  report: { 
    create: jest.fn().mockResolvedValue({}),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

const mockNotificationsService = {
  create: jest.fn().mockResolvedValue({}),
};

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('generateReport()', () => {
    it('should generate a users report', async () => {
      const report = await service.generateReport('users', 'user-1');
      expect(report.buffer).toBeInstanceOf(Buffer);
      expect(report.filename).toContain('.xlsx');
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(prisma.report.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'users',
            parameters: expect.objectContaining({ format: 'xlsx' }),
          }),
        }),
      );
    });

    it('should generate a pdf report', async () => {
      const report = await service.generateReport('summary', 'user-1', 'pdf');
      expect(report.buffer).toBeInstanceOf(Buffer);
      expect(report.contentType).toBe('application/pdf');
      expect(report.filename).toContain('.pdf');
    });

    it('should generate an activity report', async () => {
      const report = await service.generateReport('activity', 'user-1');
      expect(report).toBeDefined();
      expect(prisma.auditLog.findMany).toHaveBeenCalled();
    });

    it('should generate a summary report', async () => {
      const report = await service.generateReport('summary', 'user-1');
      expect(report).toBeDefined();
      expect(prisma.entry.count).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid report type', async () => {
      await expect(service.generateReport('invalid', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHistory()', () => {
    it('should return report history', async () => {
      (prisma.report.findMany as jest.Mock).mockResolvedValueOnce([]);
      const result = await service.getHistory({});
      expect(result).toEqual([]);
    });
  });
});
