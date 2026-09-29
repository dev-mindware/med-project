import { Injectable } from '@nestjs/common';
import { PdfOcrService } from './pdf-ocr.service';
import { VocabularyAiService } from './vocabulary-ai.service';
import { VocabularyExcelService } from './vocabulary-excel.service';
import { VocabularyProcessorService } from './vocabulary-processor.service';
import { ManualVocabularyExtractionResult } from './manual-vocabulary.types';

@Injectable()
export class ManualVocabularyService {
  constructor(
    private readonly pdfOcrService: PdfOcrService,
    private readonly vocabularyAiService: VocabularyAiService,
    private readonly vocabularyProcessorService: VocabularyProcessorService,
    private readonly vocabularyExcelService: VocabularyExcelService,
  ) {}

  async extract(
    file: Express.Multer.File,
  ): Promise<ManualVocabularyExtractionResult> {
    const text = await this.pdfOcrService.extractText(file);
    const rawItems = await this.vocabularyAiService.extractVocabulary(text);
    const workbookData = this.vocabularyProcessorService.process(rawItems);
    const buffer = await this.vocabularyExcelService.generate(workbookData);

    return {
      buffer,
      stats: workbookData.stats,
      filename: `vocabulario_manual_${Date.now()}.xlsx`,
    };
  }
}
