import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  entry: {
    findMany: jest
      .fn()
      .mockResolvedValue([
        {
          id: 'e1',
          entry: 'Mukanda',
          firstDefinition: 'Carta',
          createdAt: new Date(),
        },
      ]),
  },
  neologism: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  toponym: {
    findMany: jest
      .fn()
      .mockResolvedValue([
        { id: 't1', toponym: 'Luanda', meaning: 'Capital', province: 'Luanda' },
      ]),
  },
  anthroponym: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  foreignism: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

describe('SearchService', () => {
  let service: SearchService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('globalSearch()', () => {
    it('should return results grouped by resource type', async () => {
      const result = await service.globalSearch('angola');
      expect(result).toHaveProperty('results.entries');
      expect(result).toHaveProperty('results.neologisms');
      expect(result).toHaveProperty('results.toponyms');
      expect(result).toHaveProperty('results.anthroponyms');
      expect(result).toHaveProperty('results.foreignisms');
    });

    it('should execute 5 parallel queries (one per resource type)', async () => {
      await service.globalSearch('angola');
      expect(prisma.entry.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.neologism.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.toponym.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.anthroponym.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.foreignism.findMany).toHaveBeenCalledTimes(1);
    });

    it('should count total hits correctly', async () => {
      // entries: 1, toponyms: 1, anthroponyms: 0, foreignisms: 0 → 2
      const result = await service.globalSearch('angola');
      expect(result.totalHits).toBe(2);
    });

    it('should echo the query in the response', async () => {
      const result = await service.globalSearch('kimbundu');
      expect(result.query).toBe('kimbundu');
    });

    it('should add _type and _url to each result item', async () => {
      const result = await service.globalSearch('luanda');
      expect(result.results.entries.items[0]).toHaveProperty('_type', 'entry');
      expect(result.results.entries.items[0]).toHaveProperty('_url');
      expect(result.results.toponyms.items[0]).toHaveProperty(
        '_type',
        'toponym',
      );
    });

    it('should respect custom limit parameter', async () => {
      await service.globalSearch('angola', 5);
      expect(prisma.entry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
      expect(prisma.neologism.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });

    it('should only query APPROVED content', async () => {
      await service.globalSearch('palavra');
      const callArgs = prisma.entry.findMany.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('approvalStatus', 'APPROVED');
    });

    it('should return totalHits: 0 when nothing is found', async () => {
      prisma.entry.findMany.mockResolvedValueOnce([]);
      prisma.neologism.findMany.mockResolvedValueOnce([]);
      prisma.toponym.findMany.mockResolvedValueOnce([]);
      prisma.anthroponym.findMany.mockResolvedValueOnce([]);
      prisma.foreignism.findMany.mockResolvedValueOnce([]);
      const result = await service.globalSearch('zzz');
      expect(result.totalHits).toBe(0);
    });
  });
});
