import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Response } from 'express';

const mockReport = {
  buffer: Buffer.from('report'),
  contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  filename: 'users_report.xlsx',
  format: 'xlsx',
};

const mockReportsService = {
  generateReport: jest.fn().mockResolvedValue(mockReport),
  getHistory: jest.fn().mockResolvedValue([]),
};

const mockResponse = {
  setHeader: jest.fn(),
  send: jest.fn(),
} as any as Response;

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: typeof mockReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get(ReportsService);
    jest.clearAllMocks();
  });

  describe('generateReport()', () => {
    it('should set headers and write to response', async () => {
      const req = { user: { id: 'user-1' } };
      await controller.generateReport('users', 'xlsx', req, mockResponse);
      
      expect(service.generateReport).toHaveBeenCalledWith('users', 'user-1', 'xlsx');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', expect.any(String));
      expect(mockResponse.send).toHaveBeenCalledWith(mockReport.buffer);
    });
  });

  describe('findAll()', () => {
    it('should call getHistory with pagination', async () => {
      const filters = { page: 1, limit: 10 } as any;
      await controller.findAll(filters);
      expect(service.getHistory).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
    });
  });
});
