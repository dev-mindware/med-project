import { Test, TestingModule } from '@nestjs/testing';
import { ForeignismsService } from './foreignisms.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

const mockForeignism = {
  id: 'foreign-uuid-1',
  term: 'Software',
  originalLanguage: 'Inglês',
  definition: 'Conjunto de programas de computador',
  context: 'Tecnologia',
  approvalStatus: ApprovalStatus.APPROVED,
  createdById: 'user-uuid-1',
  createdAt: new Date('2024-01-01'),
};

const mockPrismaService = {
  foreignism: {
    create: jest.fn().mockResolvedValue(mockForeignism),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([mockForeignism]),
    findUnique: jest.fn().mockResolvedValue(mockForeignism),
    update: jest.fn().mockResolvedValue(mockForeignism),
    delete: jest.fn().mockResolvedValue(mockForeignism),
  },
};

describe('ForeignismsService', () => {
  let service: ForeignismsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForeignismsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ForeignismsService>(ForeignismsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a foreignism', async () => {
      const data = { term: 'Software', originalLanguage: 'Inglês' } as any;
      const result = await service.create(data);
      expect(result).toEqual(mockForeignism);
      expect(prisma.foreignism.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('findAll()', () => {
    it('should return all foreignisms', async () => {
      const result = await service.findAll({ skip: 0, take: 10 });
      expect(result).toEqual([mockForeignism]);
    });

    it('should accept filtering and pagination', async () => {
      await service.findAll({
        skip: 0,
        take: 20,
        where: { context: 'Tecnologia' },
      });
      expect(prisma.foreignism.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne()', () => {
    it('should return a foreignism by id', async () => {
      const result = await service.findOne({ id: 'foreign-uuid-1' });
      expect(result).toEqual(mockForeignism);
    });

    it('should return null if not found', async () => {
      prisma.foreignism.findUnique.mockResolvedValueOnce(null);
      expect(await service.findOne({ id: 'ghost' })).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update and return the foreignism', async () => {
      const updated = { ...mockForeignism, term: 'Hardware' };
      prisma.foreignism.update.mockResolvedValueOnce(updated);
      const result = await service.update({
        where: { id: 'foreign-uuid-1' },
        data: { term: 'Hardware' },
      });
      expect(result.term).toBe('Hardware');
    });
  });

  describe('remove()', () => {
    it('should delete and return the foreignism', async () => {
      const result = await service.remove({ id: 'foreign-uuid-1' });
      expect(result).toEqual(mockForeignism);
      expect(prisma.foreignism.delete).toHaveBeenCalledWith({
        where: { id: 'foreign-uuid-1' },
      });
    });
  });

  describe('search()', () => {
    it('should return matching foreignisms', async () => {
      const result = await service.search('Software', { skip: 0, take: 10 });
      expect(result).toEqual([mockForeignism]);
    });

    it('should return [] for no matches', async () => {
      prisma.foreignism.findMany.mockResolvedValueOnce([]);
      const result = await service.search('inexistente', {});
      expect(result).toHaveLength(0);
    });

    it('should pass the correct FTS query structure', async () => {
      await service.search('programa computador', {});
      const callArgs = prisma.foreignism.findMany.mock.calls[0][0];
      expect(JSON.stringify(callArgs.where)).toContain('search');
    });
  });
});
