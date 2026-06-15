import { Test, TestingModule } from '@nestjs/testing';
import { EntriesService } from './entries.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

const mockEntry = {
  id: 'entry-uuid-1',
  entry: 'Mukanda',
  pronunciation: 'mu.kan.da',
  firstDefinition: 'Carta, missiva',
  approvalStatus: ApprovalStatus.APPROVED,
  isVocabulary: false,
  isVocabularyEP: false,
  isForeignism: false,

  createdById: 'user-uuid-1',
  createdAt: new Date('2024-01-01'),
};

const mockPrismaService = {
  entry: {
    create: jest.fn().mockResolvedValue(mockEntry),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([mockEntry]),
    findUnique: jest.fn().mockResolvedValue(mockEntry),
    update: jest.fn().mockResolvedValue(mockEntry),
    delete: jest.fn().mockResolvedValue(mockEntry),
  },
};

describe('EntriesService', () => {
  let service: EntriesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EntriesService>(EntriesService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create an entry and return it', async () => {
      const data = { entry: 'Mukanda', firstDefinition: 'Carta' } as any;
      const result = await service.create(data);
      expect(result).toEqual(mockEntry);
      expect(prisma.entry.create).toHaveBeenCalledWith({ data });
    });
  });

  // ─── FIND ALL ──────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return an array of entries', async () => {
      const result = await service.findAll({ skip: 0, take: 10 });
      expect(result).toEqual([mockEntry]);
      expect(prisma.entry.findMany).toHaveBeenCalledTimes(1);
    });

    it('should pass skip/take params to prisma', async () => {
      await service.findAll({ skip: 20, take: 5 });
      expect(prisma.entry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 5 }),
      );
    });
  });

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a single entry', async () => {
      const result = await service.findOne({ id: 'entry-uuid-1' });
      expect(result).toEqual(mockEntry);
    });

    it('should return null if entry does not exist', async () => {
      prisma.entry.findUnique.mockResolvedValueOnce(null);
      const result = await service.findOne({ id: 'non-existent' });
      expect(result).toBeNull();
    });
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update and return the entry', async () => {
      const updated = { ...mockEntry, entry: 'Updated' };
      prisma.entry.update.mockResolvedValueOnce(updated);
      const result = await service.update({
        where: { id: 'entry-uuid-1' },
        data: { entry: 'Updated' },
      });
      expect(result.entry).toBe('Updated');
    });
  });

  // ─── REMOVE ───────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete and return the deleted entry', async () => {
      const result = await service.remove({ id: 'entry-uuid-1' });
      expect(result).toEqual(mockEntry);
      expect(prisma.entry.delete).toHaveBeenCalledWith({
        where: { id: 'entry-uuid-1' },
      });
    });
  });

  // ─── SEARCH ───────────────────────────────────────────────────────────────
  describe('search()', () => {
    it('should return filtered entries for a query', async () => {
      const result = await service.search('Mukanda', { skip: 0, take: 10 });
      expect(result).toEqual([mockEntry]);
      expect(prisma.entry.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no results match', async () => {
      prisma.entry.findMany.mockResolvedValueOnce([]);
      const result = await service.search('xyz_nonexistent', {});
      expect(result).toEqual([]);
    });

    it('should build correct search query with multiple words', async () => {
      await service.search('carta missiva', {});
      const callArgs = prisma.entry.findMany.mock.calls[0][0];
      // Verify the FTS query structure is present
      expect(JSON.stringify(callArgs.where)).toContain('search');
    });
  });

  describe('importRows()', () => {
    it('should import valid rows and return created summary', async () => {
      const result = await service.importRows(
        [{ rowNumber: 2, data: { entry: 'Casa', firstDefinition: 'Lugar de habitacao' } }],
        'user-uuid-1',
      );

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(result.created[0]).toEqual({
        rowNumber: 2,
        id: mockEntry.id,
        label: mockEntry.entry,
      });
      expect(prisma.entry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entry: 'Casa',
          firstDefinition: 'Lugar de habitacao',
          approvalStatus: ApprovalStatus.DRAFT,
          createdBy: { connect: { id: 'user-uuid-1' } },
        }),
      });
    });

    it('should return row validation errors without importing invalid rows', async () => {
      const result = await service.importRows(
        [{ rowNumber: 2, data: { entry: '' } }],
        'user-uuid-1',
      );

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBeGreaterThan(0);
      expect(prisma.entry.create).not.toHaveBeenCalled();
    });

    it('should reject duplicate terms inside the same file', async () => {
      const result = await service.importRows(
        [
          { rowNumber: 2, data: { entry: 'Casa', firstDefinition: 'Lugar de habitacao' } },
          { rowNumber: 3, data: { entry: ' casa ', firstDefinition: 'Duplicado' } },
        ],
        'user-uuid-1',
      );

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0]).toEqual(
        expect.objectContaining({
          rowNumber: 3,
          field: 'entry',
          message: 'Vocábulo duplicado no ficheiro',
        }),
      );
    });

    it('should report existing duplicate terms as row errors', async () => {
      prisma.entry.findFirst.mockResolvedValueOnce({ id: 'existing-entry' });

      const result = await service.importRows(
        [{ rowNumber: 2, data: { entry: 'Casa', firstDefinition: 'Lugar de habitacao' } }],
        'user-uuid-1',
      );

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].message).toContain('entrada');
    });
  });
});
