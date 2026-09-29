import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { NotFoundException } from '@nestjs/common';

const mockLog = {
  id: 'log-1',
  action: 'CREATE',
  entity: 'Entry',
  entityId: 'entry-1',
};

const mockAuditLogsService = {
  findAll: jest.fn().mockResolvedValue([mockLog]),
  findOne: jest.fn().mockResolvedValue(mockLog),
};

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let service: typeof mockAuditLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
    service = module.get(AuditLogsService);
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    it('should call service.findAll with filters and pagination', async () => {
      const filters = { page: 1, limit: 10, action: 'CREATE' } as any;
      await controller.findAll(filters);
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: expect.objectContaining({ action: 'CREATE' }),
        }),
      );
    });

    it('should handle date filters', async () => {
      const filters = { from: '2023-01-01', to: '2023-12-31' } as any;
      await controller.findAll(filters);
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return log if found', async () => {
      const result = await controller.findOne('log-1');
      expect(result).toEqual(mockLog);
    });

    it('should throw NotFoundException if not found', async () => {
      service.findOne.mockResolvedValueOnce(null);
      await expect(controller.findOne('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
