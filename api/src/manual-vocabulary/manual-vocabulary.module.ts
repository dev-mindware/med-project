import { Module } from '@nestjs/common';
import { ManualVocabularyController } from './manual-vocabulary.controller';
import { ManualVocabularyService } from './manual-vocabulary.service';
import { PdfOcrService } from './pdf-ocr.service';
import { VocabularyAiService } from './vocabulary-ai.service';
import { VocabularyExcelService } from './vocabulary-excel.service';
import { VocabularyProcessorService } from './vocabulary-processor.service';

@Module({
  controllers: [ManualVocabularyController],
  providers: [
    ManualVocabularyService,
    PdfOcrService,
    VocabularyAiService,
    VocabularyExcelService,
    VocabularyProcessorService,
  ],
})
export class ManualVocabularyModule {}
