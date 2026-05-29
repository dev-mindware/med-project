import { Test, TestingModule } from '@nestjs/testing';
import { ToponymsService } from './toponyms.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

const mockToponym = {
  id: 'toponym-uuid-1',
  toponym: 'Luanda',
  meaning: 'Capital de Angola',
  province: 'Luanda',
  approvalStatus: ApprovalStatus.APPROVED,
  createdById: 'user-uuid-1',
  createdAt: new Date('2024-01-01'),
};

const mockPrismaService = {
  toponym: {
    create: jest.fn().mockResolvedValue(mockToponym),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([mockToponym]),
    findUnique: jest.fn().mockResolvedValue(mockToponym),
    update: jest.fn().mockResolvedValue(mockToponym),
    delete: jest.fn().mockResolvedValue(mockToponym),
  },
};

describe('ToponymsService', () => {
  let service: ToponymsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToponymsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ToponymsService>(ToponymsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a toponym', async () => {
      const data = { toponym: 'Luanda', meaning: 'Capital' } as any;
      const result = await service.create(data);
      expect(result).toEqual(mockToponym);
      expect(prisma.toponym.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('findAll()', () => {
    it('should return an array of toponyms', async () => {
      const result = await service.findAll({ skip: 0, take: 10 });
      expect(result).toEqual([mockToponym]);
    });

    it('should return empty array when no toponyms exist', async () => {
      prisma.toponym.findMany.mockResolvedValueOnce([]);
      const result = await service.findAll({});
      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return a toponym by id', async () => {
      const result = await service.findOne({ id: 'toponym-uuid-1' });
      expect(result).toEqual(mockToponym);
    });

    it('should return null for non-existent toponym', async () => {
      prisma.toponym.findUnique.mockResolvedValueOnce(null);
      const result = await service.findOne({ id: 'ghost-id' });
      expect(result).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update a toponym', async () => {
      const updated = { ...mockToponym, meaning: 'Cidade Capital' };
      prisma.toponym.update.mockResolvedValueOnce(updated);
      const result = await service.update({
        where: { id: 'toponym-uuid-1' },
        data: { meaning: 'Cidade Capital' },
      });
      expect(result.meaning).toBe('Cidade Capital');
    });
  });

  describe('remove()', () => {
    it('should delete and return the toponym', async () => {
      const result = await service.remove({ id: 'toponym-uuid-1' });
      expect(result).toEqual(mockToponym);
    });
  });

  describe('search()', () => {
    it('should return results for a valid query', async () => {
      const result = await service.search('Luanda', { skip: 0, take: 10 });
      expect(result).toEqual([mockToponym]);
    });

    it('should handle empty results gracefully', async () => {
      prisma.toponym.findMany.mockResolvedValueOnce([]);
      const result = await service.search('nonexistent', {});
      expect(result).toEqual([]);
    });

    it('should tokenize multi-word queries for FTS', async () => {
      await service.search('cidade capital angola', {});
      const callArgs = prisma.toponym.findMany.mock.calls[0][0];
      expect(JSON.stringify(callArgs.where)).toContain('search');
    });
  });
});
