import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { UserRole } from '@prisma/client';

const mockStatsService = {
  getDashboardGlobal: jest.fn().mockResolvedValue({ totalEntries: 100 }),
  getUserDashboard: jest.fn().mockResolvedValue({ myEntries: 10 }),
};

describe('StatsController', () => {
  let controller: StatsController;
  let service: typeof mockStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [{ provide: StatsService, useValue: mockStatsService }],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get(StatsService);
    jest.clearAllMocks();
  });

  describe('getGlobalDashboard()', () => {
    it('should call getDashboardGlobal', async () => {
      const result = await controller.getGlobalDashboard();
      expect(result).toHaveProperty('totalEntries');
      expect(service.getDashboardGlobal).toHaveBeenCalled();
    });
  });

  describe('getMeDashboard()', () => {
    it('should call getUserDashboard with req.user info', async () => {
      const req = { user: { id: 'user-1', role: UserRole.OPERATOR } };
      await controller.getMeDashboard(req as any);
      expect(service.getUserDashboard).toHaveBeenCalledWith(
        'user-1',
        UserRole.OPERATOR,
      );
    });
  });

  describe('getUserDashboard()', () => {
    it('should call getUserDashboard for a specific user', async () => {
      await controller.getUserDashboard('user-2');
      expect(service.getUserDashboard).toHaveBeenCalledWith(
        'user-2',
        UserRole.OPERATOR,
      );
    });
  });
});
