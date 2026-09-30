import { Module } from '@nestjs/common';
import { ManualVocabularyController } from './manual-vocabulary.controller';
import { ManualVocabularyService } from './manual-vocabulary.service';
import { ManualVocabularyLogService } from './manual-vocabulary-log.service';
import { PdfOcrService } from './pdf-ocr.service';
import { VocabularyAiService } from './vocabulary-ai.service';
import { VocabularyExcelService } from './vocabulary-excel.service';
import { VocabularyProcessorService } from './vocabulary-processor.service';

@Module({
  controllers: [ManualVocabularyController],
  providers: [
    ManualVocabularyService,
    ManualVocabularyLogService,
    PdfOcrService,
    VocabularyAiService,
    VocabularyExcelService,
    VocabularyProcessorService,
  ],
  exports: [ManualVocabularyService, ManualVocabularyLogService],
})
export class ManualVocabularyModule {}
