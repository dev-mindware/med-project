import { Test, TestingModule } from '@nestjs/testing';
import { ToponymsController } from './toponyms.controller';
import { ToponymsService } from './toponyms.service';
import { UserRole, ApprovalStatus } from '@prisma/client';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

const mockToponym = {
  id: 'toponym-1',
  toponym: 'Luanda',
  meaning: 'Capital',
  province: 'Luanda',
  approvalStatus: ApprovalStatus.DRAFT,
  createdById: 'user-op-1',
};

const mockToponymsService = {
  create: jest.fn().mockResolvedValue(mockToponym),
  findAll: jest.fn().mockResolvedValue([mockToponym]),
  findOne: jest.fn().mockResolvedValue(mockToponym),
  update: jest.fn().mockResolvedValue(mockToponym),
  remove: jest.fn().mockResolvedValue(mockToponym),
  search: jest.fn().mockResolvedValue([mockToponym]),
};

describe('ToponymsController', () => {
  let controller: ToponymsController;
  let service: typeof mockToponymsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToponymsController],
      providers: [{ provide: ToponymsService, useValue: mockToponymsService }],
    }).compile();

    controller = module.get<ToponymsController>(ToponymsController);
    service = module.get(ToponymsService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should call service.create', async () => {
      const req = { user: { id: 'user-1' } };
      const dto = { toponym: 'Luanda', province: 'Luanda' } as any;
      await controller.create(req as any, dto);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('should call search if query is provided', async () => {
      const filters = { search: 'test', page: 1, limit: 10 } as any;
      await controller.findAll(filters);
      expect(service.search).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return a toponym', async () => {
      const result = await controller.findOne('toponym-1');
      expect(result).toEqual(mockToponym);
    });
  });

  describe('update()', () => {
    it('should throw ForbiddenException for unauthorized operator', async () => {
      const req = { user: { id: 'user-op-2', role: UserRole.OPERATOR } };
      await expect(
        controller.update('toponym-1', req as any, {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('review()', () => {
    it('should allow admin to approve', async () => {
      const req = { user: { id: 'admin-1', role: UserRole.ADMIN } };
      await controller.review('toponym-1', req as any, ApprovalStatus.APPROVED);
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('generateSchema()', () => {
    it('should return Place schema', async () => {
      const result = await controller.generateSchema('toponym-1');
      expect(result).toHaveProperty('@type', 'Place');
      expect(result.name).toBe(mockToponym.toponym);
    });
  });
});
