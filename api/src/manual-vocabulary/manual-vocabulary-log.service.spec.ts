import { ManualVocabularyLogService } from './manual-vocabulary-log.service';
import { ManualVocabularyStats } from './manual-vocabulary.types';

describe('ManualVocabularyLogService', () => {
  let service: ManualVocabularyLogService;
  let prismaMock: any;
  let loggerMock: any;

  const mockStats: ManualVocabularyStats = {
    totalTerms: 10,
    validRows: 9,
    entries: 5,
    neologisms: 0,
    toponyms: 2,
    anthroponyms: 1,
    foreignisms: 1,
    warnings: 1,
    duplicatesRemoved: 1,
    lowConfidenceDiscarded: 0,
  };

  beforeEach(() => {
    prismaMock = {
      manualExtractionLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    service = new ManualVocabularyLogService(prismaMock, loggerMock);
  });

  describe('logExtraction', () => {
    it('persists extraction log with all stats and metrics', async () => {
      const createdRecord = {
        id: 'log-uuid-1',
        filename: 'manual-angola.pdf',
        fileSize: 10240,
        userId: 'user-uuid-1',
        model: 'gemini-2.5-flash',
        ...mockStats,
        processingMs: 1500,
        createdAt: new Date(),
      };

      prismaMock.manualExtractionLog.create.mockResolvedValue(createdRecord);

      const result = await service.logExtraction({
        filename: 'manual-angola.pdf',
        fileSize: 10240,
        userId: 'user-uuid-1',
        model: 'gemini-2.5-flash',
        stats: mockStats,
        processingMs: 1500,
      });

      expect(prismaMock.manualExtractionLog.create).toHaveBeenCalledWith({
        data: {
          filename: 'manual-angola.pdf',
          fileSize: 10240,
          userId: 'user-uuid-1',
          model: 'gemini-2.5-flash',
          totalTerms: 10,
          validRows: 9,
          entries: 5,
          neologisms: 0,
          toponyms: 2,
          anthroponyms: 1,
          foreignisms: 1,
          warnings: 1,
          duplicatesRemoved: 1,
          lowConfidenceDiscarded: 0,
          processingMs: 1500,
        },
      });
      expect(result).toEqual(createdRecord);
      expect(loggerMock.info).toHaveBeenCalledWith(
        expect.stringContaining('sucesso'),
        expect.any(Object),
      );
    });

    it('catches and logs errors without throwing when database operation fails', async () => {
      prismaMock.manualExtractionLog.create.mockRejectedValue(
        new Error('Database offline'),
      );

      const result = await service.logExtraction({
        filename: 'manual-angola.pdf',
        fileSize: 10240,
        userId: 'user-uuid-1',
        model: 'gemini-2.5-flash',
        stats: mockStats,
        processingMs: 1500,
      });

      expect(result).toBeNull();
      expect(loggerMock.error).toHaveBeenCalledWith(
        expect.stringContaining('Falha ao gravar registo'),
        expect.objectContaining({
          context: 'ManualVocabularyLogService',
          action: 'LOG_EXTRACTION_ERROR',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('returns paginated items and total count', async () => {
      const logs = [{ id: 'log-1' }, { id: 'log-2' }];
      prismaMock.manualExtractionLog.findMany.mockResolvedValue(logs);
      prismaMock.manualExtractionLog.count.mockResolvedValue(2);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(prismaMock.manualExtractionLog.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
      expect(result).toEqual({ items: logs, total: 2 });
    });

    it('filters by userId when provided', async () => {
      prismaMock.manualExtractionLog.findMany.mockResolvedValue([]);
      prismaMock.manualExtractionLog.count.mockResolvedValue(0);

      await service.findAll({ userId: 'user-123' });

      expect(prismaMock.manualExtractionLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-123' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('finds log by ID with user relation', async () => {
      const log = { id: 'log-123', filename: 'teste.pdf' };
      prismaMock.manualExtractionLog.findUnique.mockResolvedValue(log);

      const result = await service.findById('log-123');

      expect(prismaMock.manualExtractionLog.findUnique).toHaveBeenCalledWith({
        where: { id: 'log-123' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
      expect(result).toEqual(log);
    });
  });
});
