import { ManualVocabularyService } from './manual-vocabulary.service';

describe('ManualVocabularyService', () => {
  it('runs OCR, AI, processing, Excel generation and audit logging in order', async () => {
    const pdfOcrService = { extractText: jest.fn().mockResolvedValue('texto') };
    const vocabularyAiService = {
      extractVocabulary: jest
        .fn()
        .mockResolvedValue([{ sourceModel: 'ENTRY', data: { entry: 'Casa' } }]),
      getModelName: jest.fn().mockReturnValue('gemini-2.5-flash'),
    };
    const workbookData = {
      entries: [],
      neologisms: [],
      toponyms: [],
      anthroponyms: [],
      foreignisms: [],
      warnings: [],
      stats: {
        totalTerms: 1,
        validRows: 1,
        entries: 1,
        neologisms: 0,
        toponyms: 0,
        anthroponyms: 0,
        foreignisms: 0,
        warnings: 0,
        duplicatesRemoved: 0,
        lowConfidenceDiscarded: 0,
      },
    };
    const vocabularyProcessorService = {
      process: jest.fn().mockReturnValue(workbookData),
    };
    const vocabularyExcelService = {
      generate: jest.fn().mockResolvedValue(Buffer.from('xlsx')),
    };
    const logService = {
      logExtraction: jest.fn().mockResolvedValue({ id: 'log-1' }),
    };

    const prisma = {
      entry: { findFirst: jest.fn(), create: jest.fn() },
      neologism: { findFirst: jest.fn(), create: jest.fn() },
      toponym: { findFirst: jest.fn(), create: jest.fn() },
      anthroponym: { findFirst: jest.fn(), create: jest.fn() },
      foreignism: { findFirst: jest.fn(), create: jest.fn() },
    };

    const service = new ManualVocabularyService(
      pdfOcrService as any,
      vocabularyAiService as any,
      vocabularyProcessorService as any,
      vocabularyExcelService as any,
      logService as any,
      prisma as any,
    );

    const result = await service.extract(
      {
        originalname: 'manual.pdf',
        size: 2048,
      } as Express.Multer.File,
      'user-123',
    );

    expect(pdfOcrService.extractText).toHaveBeenCalled();
    expect(vocabularyAiService.extractVocabulary).toHaveBeenCalledWith(
      'texto',
      undefined,
    );
    expect(vocabularyProcessorService.process).toHaveBeenCalledWith(
      [{ sourceModel: 'ENTRY', data: { entry: 'Casa' } }],
      undefined,
    );
    expect(vocabularyExcelService.generate).toHaveBeenCalledWith(workbookData);
    expect(logService.logExtraction).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'manual.pdf',
        fileSize: 2048,
        userId: 'user-123',
        model: 'gemini-2.5-flash',
        stats: workbookData.stats,
        processingMs: expect.any(Number),
      }),
    );
    expect(result.buffer.toString()).toBe('xlsx');
    expect(result.filename).toContain('vocabulario_manual_');
    expect(result.workbookData).toBe(workbookData);
  });

  it('commitToDatabase deduplicates terms within batch and against database', async () => {
    const prisma = {
      entry: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({ id: 'existing-1' }) // 'casa' exists
          .mockResolvedValueOnce(null), // 'musseque' does not exist
        create: jest.fn().mockResolvedValue({ id: 'new-1' }),
      },
      neologism: { findFirst: jest.fn(), create: jest.fn() },
      toponym: { findFirst: jest.fn(), create: jest.fn() },
      anthroponym: { findFirst: jest.fn(), create: jest.fn() },
      foreignism: { findFirst: jest.fn(), create: jest.fn() },
    };

    const service = new ManualVocabularyService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      prisma as any,
    );

    const commitResult = await service.commitToDatabase(
      {
        entries: [
          { entry: 'casa', firstDefinition: 'Habitação' },
          { entry: 'CASA', firstDefinition: 'Habitação repetida no lote' },
          { entry: 'musseque', firstDefinition: 'Bairro periférico' },
        ],
      },
      'user-1',
    );

    expect(commitResult.insertedCount).toBe(1);
    expect(commitResult.duplicatesCount).toBe(2);
    expect(commitResult.skippedDuplicates).toHaveLength(2);
    expect(commitResult.skippedDuplicates[0].reason).toContain('próprio lote');
    expect(commitResult.skippedDuplicates[1].reason).toContain('base de dados');
    expect(prisma.entry.create).toHaveBeenCalledTimes(1);
    expect(prisma.entry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entry: 'musseque',
          approvalStatus: 'DRAFT',
        }),
      }),
    );
  });
});

