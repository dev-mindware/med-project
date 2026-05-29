import { ManualVocabularyService } from './manual-vocabulary.service';

describe('ManualVocabularyService', () => {
  it('runs OCR, AI, processing and Excel generation in order', async () => {
    const pdfOcrService = { extractText: jest.fn().mockResolvedValue('texto') };
    const vocabularyAiService = {
      extractVocabulary: jest.fn().mockResolvedValue([{ sourceModel: 'ENTRY', data: { entry: 'Casa' } }]),
    };
    const workbookData = {
      entries: [],
      toponyms: [],
      anthroponyms: [],
      foreignisms: [],
      warnings: [],
      stats: {
        totalTerms: 1,
        validRows: 1,
        entries: 1,
        toponyms: 0,
        anthroponyms: 0,
        foreignisms: 0,
        warnings: 0,
        duplicatesRemoved: 0,
      },
    };
    const vocabularyProcessorService = { process: jest.fn().mockReturnValue(workbookData) };
    const vocabularyExcelService = { generate: jest.fn().mockResolvedValue(Buffer.from('xlsx')) };
    const service = new ManualVocabularyService(
      pdfOcrService as any,
      vocabularyAiService as any,
      vocabularyProcessorService as any,
      vocabularyExcelService as any,
    );

    const result = await service.extract({ originalname: 'manual.pdf' } as Express.Multer.File);

    expect(pdfOcrService.extractText).toHaveBeenCalled();
    expect(vocabularyAiService.extractVocabulary).toHaveBeenCalledWith('texto');
    expect(vocabularyProcessorService.process).toHaveBeenCalledWith([{ sourceModel: 'ENTRY', data: { entry: 'Casa' } }]);
    expect(vocabularyExcelService.generate).toHaveBeenCalledWith(workbookData);
    expect(result.buffer.toString()).toBe('xlsx');
    expect(result.filename).toContain('vocabulario_manual_');
  });
});
