import { Test, TestingModule } from '@nestjs/testing';
import { AnthroponymsService } from './anthroponyms.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

const mockAnthroponym = {
  id: 'anthro-uuid-1',
  name: 'Kiluanje',
  meaning: 'Aquele que traz luz',
  gender: 'MASCULINE',
  etymology: 'Kimbundu',
  approvalStatus: ApprovalStatus.APPROVED,
  createdById: 'user-uuid-1',
  createdAt: new Date('2024-01-01'),
};

const mockPrismaService = {
  anthroponym: {
    create: jest.fn().mockResolvedValue(mockAnthroponym),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([mockAnthroponym]),
    findUnique: jest.fn().mockResolvedValue(mockAnthroponym),
    update: jest.fn().mockResolvedValue(mockAnthroponym),
    delete: jest.fn().mockResolvedValue(mockAnthroponym),
  },
};

describe('AnthroponymsService', () => {
  let service: AnthroponymsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnthroponymsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnthroponymsService>(AnthroponymsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create and return an anthroponym', async () => {
      const data = { name: 'Kiluanje', meaning: 'Aquele que traz luz' } as any;
      const result = await service.create(data);
      expect(result).toEqual(mockAnthroponym);
      expect(prisma.anthroponym.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('findAll()', () => {
    it('should return an array of anthroponyms', async () => {
      const result = await service.findAll({ skip: 0, take: 10 });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Kiluanje');
    });

    it('should propagate filters to prisma', async () => {
      await service.findAll({ skip: 10, take: 5, where: { gender: 'MASCULINE' } });
      expect(prisma.anthroponym.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return a single anthroponym', async () => {
      const result = await service.findOne({ id: 'anthro-uuid-1' });
      expect(result).toEqual(mockAnthroponym);
    });

    it('should return null for an unknown id', async () => {
      prisma.anthroponym.findUnique.mockResolvedValueOnce(null);
      expect(await service.findOne({ id: 'unknown' })).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update an anthroponym', async () => {
      const updated = { ...mockAnthroponym, name: 'Kiluanji' };
      prisma.anthroponym.update.mockResolvedValueOnce(updated);
      const result = await service.update({
        where: { id: 'anthro-uuid-1' },
        data: { name: 'Kiluanji' },
      });
      expect(result.name).toBe('Kiluanji');
    });
  });

  describe('remove()', () => {
    it('should delete and return the anthroponym', async () => {
      const result = await service.remove({ id: 'anthro-uuid-1' });
      expect(result).toEqual(mockAnthroponym);
      expect(prisma.anthroponym.delete).toHaveBeenCalledWith({
        where: { id: 'anthro-uuid-1' },
      });
    });
  });

  describe('search()', () => {
    it('should return results matching the query', async () => {
      const result = await service.search('Kiluanje', { skip: 0, take: 10 });
      expect(result).toEqual([mockAnthroponym]);
    });

    it('should return empty array when query has no matches', async () => {
      prisma.anthroponym.findMany.mockResolvedValueOnce([]);
      const result = await service.search('zzz_unknown', {});
      expect(result).toHaveLength(0);
    });
  });
});
