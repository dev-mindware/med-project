import { Injectable } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PdfOcrService } from './pdf-ocr.service';
import { VocabularyAiService } from './vocabulary-ai.service';
import { VocabularyExcelService } from './vocabulary-excel.service';
import { VocabularyProcessorService } from './vocabulary-processor.service';
import { ManualVocabularyLogService } from './manual-vocabulary-log.service';
import {
  ManualVocabularyCommitPayload,
  ManualVocabularyCommitResult,
  ManualVocabularyExtractionResult,
  ManualVocabularySourceModel,
  ManualVocabularyWorkbookData,
} from './manual-vocabulary.types';
/** Converte um valor unknown para string de forma segura (evita no-base-to-string). */
function toStr(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}


/**
 * Orquestra o pipeline completo de extracção de vocabulário de manuais PDF,
 * importação/exportação de Excel e persistência na base de dados com validação forte de duplicatas.
 *
 * Norma ortográfica: Acordo Ortográfico de 1945 (AO45), usado em Angola.
 */
@Injectable()
export class ManualVocabularyService {
  constructor(
    private readonly pdfOcrService: PdfOcrService,
    private readonly vocabularyAiService: VocabularyAiService,
    private readonly vocabularyProcessorService: VocabularyProcessorService,
    private readonly vocabularyExcelService: VocabularyExcelService,
    private readonly logService: ManualVocabularyLogService,
    private readonly prisma: PrismaService,
  ) {}

  async extract(
    file: Express.Multer.File,
    userId?: string,
    selectedModules?: ManualVocabularySourceModel[],
    pageOptions?: { startPage?: number; endPage?: number },
  ): Promise<ManualVocabularyExtractionResult> {
    const startTime = Date.now();

    // 1. OCR / Extracção de texto do PDF → texto limpo
    const text = await this.pdfOcrService.extractText(file, pageOptions);

    // 2. IA classifica e extrai itens lexicais (com foco nos módulos seleccionados)
    const rawItems = await this.vocabularyAiService.extractVocabulary(
      text,
      selectedModules,
    );

    // 3. Processa: valida, normaliza, deduplica e agrupa por modelo
    const workbookData = this.vocabularyProcessorService.process(
      rawItems,
      selectedModules,
    );

    // 4. Gera Excel com folhas por modelo + formatação condicional por confiança
    const buffer = await this.vocabularyExcelService.generate(workbookData);

    const processingMs = Date.now() - startTime;
    const model = this.vocabularyAiService.getModelName();

    // 5. Registo de auditoria da extracção
    await this.logService.logExtraction({
      filename: file.originalname,
      fileSize: file.size,
      userId,
      model,
      stats: workbookData.stats,
      processingMs,
    });

    return {
      buffer,
      stats: workbookData.stats,
      workbookData,
      filename: `vocabulario_manual_${Date.now()}.xlsx`,
      processingMs,
    };
  }

  async exportExcel(data: ManualVocabularyWorkbookData): Promise<Buffer> {
    return this.vocabularyExcelService.generate(data);
  }

  async parseExcel(buffer: Buffer): Promise<ManualVocabularyWorkbookData> {
    return this.vocabularyExcelService.parse(buffer);
  }

  /**
   * Salva os registos curados na base de dados com validação forte de duplicatas.
   *
   * Garante:
   * 1. Deduplicação intra-lote (ignora termos repetidos no mesmo envio).
   * 2. Deduplicação insensível a maiúsculas/minúsculas contra a base de dados em PostgreSQL.
   * 3. Neologismos são adicionalmente verificados contra a tabela de Entradas gerais.
   * 4. Cada inserção é associada ao utilizador com estado DRAFT (Rascunho) para revisão.
   * 5. Retorna relatório discriminado de itens inseridos vs. duplicados ignorados com motivo claro.
   */
  async commitToDatabase(
    payload: ManualVocabularyCommitPayload,
    userId?: string,
  ): Promise<ManualVocabularyCommitResult> {
    const skippedDuplicates: Array<{
      module: ManualVocabularySourceModel;
      term: string;
      reason: string;
    }> = [];

    const details = {
      entries: { inserted: 0, duplicates: 0 },
      neologisms: { inserted: 0, duplicates: 0 },
      toponyms: { inserted: 0, duplicates: 0 },
      anthroponyms: { inserted: 0, duplicates: 0 },
      foreignisms: { inserted: 0, duplicates: 0 },
    };

    // ── 1. Entradas (Verbetes) ──────────────────────────────────────────────
    const rawEntries = Array.isArray(payload.entries) ? payload.entries : [];
    if (rawEntries.length > 0) {
      const seenInBatch = new Set<string>();
      const validCandidates: { term: string; raw: Record<string, unknown> }[] =
        [];

      for (const raw of rawEntries) {
        const term = toStr(raw.entry, '').trim();
        if (!term) continue;
        const key = term.toLowerCase();
        if (seenInBatch.has(key)) {
          details.entries.duplicates++;
          skippedDuplicates.push({
            module: 'ENTRY',
            term,
            reason: 'Vocábulo duplicado dentro do próprio lote enviado',
          });
          continue;
        }
        seenInBatch.add(key);
        validCandidates.push({ term, raw });
      }

      for (const { term, raw } of validCandidates) {
        const existing = await this.prisma.entry.findFirst({
          where: { entry: { equals: term, mode: 'insensitive' } },
          select: { id: true },
        });

        if (existing) {
          details.entries.duplicates++;
          skippedDuplicates.push({
            module: 'ENTRY',
            term,
            reason: 'Já existe na base de dados (tabela de entradas)',
          });
          continue;
        }

        try {
          await this.prisma.entry.create({
            data: {
              entry: term,
              firstDefinition: toStr(
                raw.firstDefinition,
                'Definição a completar na revisão editorial',
              ).trim(),
              secondDefinition: raw.secondDefinition
                ? toStr(raw.secondDefinition)
                : null,
              thirdDefinition: raw.thirdDefinition
                ? toStr(raw.thirdDefinition)
                : null,
              usageExample: raw.usageExample ? toStr(raw.usageExample) : null,
              pronunciation: raw.pronunciation
                ? toStr(raw.pronunciation)
                : null,
              syllabicDivision: raw.syllabicDivision
                ? toStr(raw.syllabicDivision)
                : null,
              etymology: raw.etymology ? toStr(raw.etymology) : null,
              grammaticalCategory: raw.grammaticalCategory
                ? toStr(raw.grammaticalCategory)
                : null,
              grammaticalSubcategory: raw.grammaticalSubcategory
                ? toStr(raw.grammaticalSubcategory)
                : null,
              grammaticalStatus: raw.grammaticalStatus
                ? toStr(raw.grammaticalStatus)
                : null,
              languageCode: raw.languageCode
                ? toStr(raw.languageCode)
                : 'pt-AO',
              isVocabulary: Boolean(raw.isVocabulary),
              isVocabularyEP: Boolean(raw.isVocabularyEP),
              isForeignism: Boolean(raw.isForeignism),
              approvalStatus: ApprovalStatus.DRAFT,
              ...(userId ? { createdBy: { connect: { id: userId } } } : {}),
            },
          });
          details.entries.inserted++;
        } catch (err: any) {
          details.entries.duplicates++;
          skippedDuplicates.push({
            module: 'ENTRY',
            term,
            reason: `Erro de integridade na gravação: ${err.message || 'desconhecido'}`,
          });
        }
      }
    }

    // ── 2. Neologismos ──────────────────────────────────────────────────────
    const rawNeologisms = Array.isArray(payload.neologisms)
      ? payload.neologisms
      : [];
    if (rawNeologisms.length > 0) {
      const seenInBatch = new Set<string>();
      const validCandidates: { term: string; raw: Record<string, unknown> }[] =
        [];

      for (const raw of rawNeologisms) {
        const term = toStr(raw.entry, '').trim();
        if (!term) continue;
        const key = term.toLowerCase();
        if (seenInBatch.has(key)) {
          details.neologisms.duplicates++;
          skippedDuplicates.push({
            module: 'NEOLOGISM',
            term,
            reason: 'Neologismo duplicado dentro do próprio lote enviado',
          });
          continue;
        }
        seenInBatch.add(key);
        validCandidates.push({ term, raw });
      }

      for (const { term, raw } of validCandidates) {
        const existingNeo = await this.prisma.neologism.findFirst({
          where: { entry: { equals: term, mode: 'insensitive' } },
          select: { id: true },
        });
        const existingEntry = await this.prisma.entry.findFirst({
          where: { entry: { equals: term, mode: 'insensitive' } },
          select: { id: true },
        });

        if (existingNeo || existingEntry) {
          details.neologisms.duplicates++;
          skippedDuplicates.push({
            module: 'NEOLOGISM',
            term,
            reason: existingNeo
              ? 'Já existe na base de dados (tabela de neologismos)'
              : 'Já existe como verbete oficial na base de dados (tabela de entradas)',
          });
          continue;
        }

        try {
          await this.prisma.neologism.create({
            data: {
              entry: term,
              firstDefinition: toStr(
                raw.firstDefinition,
                'Definição a completar na revisão editorial',
              ).trim(),
              secondDefinition: raw.secondDefinition
                ? toStr(raw.secondDefinition)
                : null,
              thirdDefinition: raw.thirdDefinition
                ? toStr(raw.thirdDefinition)
                : null,
              usageExample: raw.usageExample ? toStr(raw.usageExample) : null,
              pronunciation: raw.pronunciation
                ? toStr(raw.pronunciation)
                : null,
              syllabicDivision: raw.syllabicDivision
                ? toStr(raw.syllabicDivision)
                : null,
              etymology: raw.etymology ? toStr(raw.etymology) : null,
              grammaticalCategory: raw.grammaticalCategory
                ? toStr(raw.grammaticalCategory)
                : null,
              grammaticalSubcategory: raw.grammaticalSubcategory
                ? toStr(raw.grammaticalSubcategory)
                : null,
              grammaticalStatus: raw.grammaticalStatus
                ? toStr(raw.grammaticalStatus)
                : null,
              languageCode: raw.languageCode
                ? toStr(raw.languageCode)
                : 'pt-AO',
              isVocabulary: Boolean(raw.isVocabulary),
              isVocabularyEP: Boolean(raw.isVocabularyEP),
              isForeignism: Boolean(raw.isForeignism),
              approvalStatus: ApprovalStatus.DRAFT,
              ...(userId ? { createdBy: { connect: { id: userId } } } : {}),
            },
          });
          details.neologisms.inserted++;
        } catch (err: any) {
          details.neologisms.duplicates++;
          skippedDuplicates.push({
            module: 'NEOLOGISM',
            term,
            reason: `Erro de integridade na gravação: ${err.message || 'desconhecido'}`,
          });
        }
      }
    }

    // ── 3. Topónimos ────────────────────────────────────────────────────────
    const rawToponyms = Array.isArray(payload.toponyms) ? payload.toponyms : [];
    if (rawToponyms.length > 0) {
      const seenInBatch = new Set<string>();
      const validCandidates: { term: string; raw: Record<string, unknown> }[] =
        [];

      for (const raw of rawToponyms) {
        const term = toStr(raw.toponym, '').trim();
        if (!term) continue;
        const key = term.toLowerCase();
        if (seenInBatch.has(key)) {
          details.toponyms.duplicates++;
          skippedDuplicates.push({
            module: 'TOPONYM',
            term,
            reason: 'Topónimo duplicado dentro do próprio lote enviado',
          });
          continue;
        }
        seenInBatch.add(key);
        validCandidates.push({ term, raw });
      }

      for (const { term, raw } of validCandidates) {
        const existing = await this.prisma.toponym.findFirst({
          where: { toponym: { equals: term, mode: 'insensitive' } },
          select: { id: true },
        });

        if (existing) {
          details.toponyms.duplicates++;
          skippedDuplicates.push({
            module: 'TOPONYM',
            term,
            reason: 'Já existe na base de dados (tabela de topónimos)',
          });
          continue;
        }

        try {
          const toponymClasses = Array.isArray(raw.toponymClasses)
            ? (raw.toponymClasses as string[]).map(String)
            : typeof raw.toponymClasses === 'string'
              ? raw.toponymClasses
                  .split(/[;,]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];
          const toponymSubclasses = Array.isArray(raw.toponymSubclasses)
            ? (raw.toponymSubclasses as string[]).map(String)
            : typeof raw.toponymSubclasses === 'string'
              ? raw.toponymSubclasses
                  .split(/[;,]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];

          await this.prisma.toponym.create({
            data: {
              toponym: term,
              province: toStr(raw.province, 'Angola').trim(),
              municipality: raw.municipality ? toStr(raw.municipality) : null,
              location: raw.location ? toStr(raw.location) : null,
              meaning: raw.meaning ? toStr(raw.meaning) : null,
              pronunciation: raw.pronunciation
                ? toStr(raw.pronunciation)
                : null,
              gentilic: raw.gentilic ? toStr(raw.gentilic) : null,
              toponymHistory: raw.toponymHistory
                ? toStr(raw.toponymHistory)
                : null,
              toponymProvenance: raw.toponymProvenance
                ? toStr(raw.toponymProvenance)
                : null,
              commonUsage: raw.commonUsage ? toStr(raw.commonUsage) : null,
              graphicVariation: raw.graphicVariation
                ? toStr(raw.graphicVariation)
                : null,
              toponymClasses,
              toponymSubclasses,
              languageCode: raw.languageCode
                ? toStr(raw.languageCode)
                : 'pt-AO',
              isVocabulary: Boolean(raw.isVocabulary),
              isVocabularyEP: Boolean(raw.isVocabularyEP),
              isForeignism: Boolean(raw.isForeignism),
              approvalStatus: ApprovalStatus.DRAFT,
              ...(userId ? { createdBy: { connect: { id: userId } } } : {}),
            },
          });
          details.toponyms.inserted++;
        } catch (err: any) {
          details.toponyms.duplicates++;
          skippedDuplicates.push({
            module: 'TOPONYM',
            term,
            reason: `Erro de integridade na gravação: ${err.message || 'desconhecido'}`,
          });
        }
      }
    }

    // ── 4. Antropónimos ─────────────────────────────────────────────────────
    const rawAnthroponyms = Array.isArray(payload.anthroponyms)
      ? payload.anthroponyms
      : [];
    if (rawAnthroponyms.length > 0) {
      const seenInBatch = new Set<string>();
      const validCandidates: { term: string; raw: Record<string, unknown> }[] =
        [];

      for (const raw of rawAnthroponyms) {
        const term = toStr(raw.name, '').trim();
        if (!term) continue;
        const key = term.toLowerCase();
        if (seenInBatch.has(key)) {
          details.anthroponyms.duplicates++;
          skippedDuplicates.push({
            module: 'ANTHROPONYM',
            term,
            reason: 'Antropónimo duplicado dentro do próprio lote enviado',
          });
          continue;
        }
        seenInBatch.add(key);
        validCandidates.push({ term, raw });
      }

      for (const { term, raw } of validCandidates) {
        const existing = await this.prisma.anthroponym.findFirst({
          where: { name: { equals: term, mode: 'insensitive' } },
          select: { id: true },
        });

        if (existing) {
          details.anthroponyms.duplicates++;
          skippedDuplicates.push({
            module: 'ANTHROPONYM',
            term,
            reason: 'Já existe na base de dados (tabela de antropónimos)',
          });
          continue;
        }

        try {
          await this.prisma.anthroponym.create({
            data: {
              name: term,
              gender: raw.gender ? toStr(raw.gender) : null,
              meaning: raw.meaning ? toStr(raw.meaning) : null,
              etymology: raw.etymology ? toStr(raw.etymology) : null,
              surname: raw.surname ? toStr(raw.surname) : null,
              surnameMeaning: raw.surnameMeaning
                ? toStr(raw.surnameMeaning)
                : null,
              historicalFigure: raw.historicalFigure
                ? toStr(raw.historicalFigure)
                : null,
              historicalFigurePseudonym: raw.historicalFigurePseudonym
                ? toStr(raw.historicalFigurePseudonym)
                : null,
              historicalFigureDomain: raw.historicalFigureDomain
                ? toStr(raw.historicalFigureDomain)
                : null,
              isVocabulary: Boolean(raw.isVocabulary),
              isVocabularyEP: Boolean(raw.isVocabularyEP),
              isForeignism: Boolean(raw.isForeignism),
              approvalStatus: ApprovalStatus.DRAFT,
              ...(userId ? { createdBy: { connect: { id: userId } } } : {}),
            },
          });
          details.anthroponyms.inserted++;
        } catch (err: any) {
          details.anthroponyms.duplicates++;
          skippedDuplicates.push({
            module: 'ANTHROPONYM',
            term,
            reason: `Erro de integridade na gravação: ${err.message || 'desconhecido'}`,
          });
        }
      }
    }

    // ── 5. Estrangeirismos ──────────────────────────────────────────────────
    const rawForeignisms = Array.isArray(payload.foreignisms)
      ? payload.foreignisms
      : [];
    if (rawForeignisms.length > 0) {
      const seenInBatch = new Set<string>();
      const validCandidates: { term: string; raw: Record<string, unknown> }[] =
        [];

      for (const raw of rawForeignisms) {
        const term = toStr(raw.term, '').trim();
        if (!term) continue;
        const key = term.toLowerCase();
        if (seenInBatch.has(key)) {
          details.foreignisms.duplicates++;
          skippedDuplicates.push({
            module: 'FOREIGNISM',
            term,
            reason: 'Estrangeirismo duplicado dentro do próprio lote enviado',
          });
          continue;
        }
        seenInBatch.add(key);
        validCandidates.push({ term, raw });
      }

      for (const { term, raw } of validCandidates) {
        const existing = await this.prisma.foreignism.findFirst({
          where: { term: { equals: term, mode: 'insensitive' } },
          select: { id: true },
        });

        if (existing) {
          details.foreignisms.duplicates++;
          skippedDuplicates.push({
            module: 'FOREIGNISM',
            term,
            reason: 'Já existe na base de dados (tabela de estrangeirismos)',
          });
          continue;
        }

        try {
          await this.prisma.foreignism.create({
            data: {
              term,
              definition: raw.definition ? toStr(raw.definition) : null,
              meaning: raw.meaning ? toStr(raw.meaning) : null,
              originalLanguage: raw.originalLanguage
                ? toStr(raw.originalLanguage)
                : null,
              originCountry: raw.originCountry
                ? toStr(raw.originCountry)
                : null,
              adaptedForm: raw.adaptedForm ? toStr(raw.adaptedForm) : null,
              originalForm: raw.originalForm ? toStr(raw.originalForm) : null,
              usageExample: raw.usageExample ? toStr(raw.usageExample) : null,
              context: raw.context ? toStr(raw.context) : null,
              field: raw.field ? toStr(raw.field) : null,
              grammaticalCategory: raw.grammaticalCategory
                ? toStr(raw.grammaticalCategory)
                : null,
              pronunciation: raw.pronunciation
                ? toStr(raw.pronunciation)
                : null,
              isVocabulary: Boolean(raw.isVocabulary),
              isVocabularyEP: Boolean(raw.isVocabularyEP),
              approvalStatus: ApprovalStatus.DRAFT,
              ...(userId ? { createdBy: { connect: { id: userId } } } : {}),
            },
          });
          details.foreignisms.inserted++;
        } catch (err: any) {
          details.foreignisms.duplicates++;
          skippedDuplicates.push({
            module: 'FOREIGNISM',
            term,
            reason: `Erro de integridade na gravação: ${err.message || 'desconhecido'}`,
          });
        }
      }
    }

    const insertedCount =
      details.entries.inserted +
      details.neologisms.inserted +
      details.toponyms.inserted +
      details.anthroponyms.inserted +
      details.foreignisms.inserted;

    const duplicatesCount =
      details.entries.duplicates +
      details.neologisms.duplicates +
      details.toponyms.duplicates +
      details.anthroponyms.duplicates +
      details.foreignisms.duplicates;

    return {
      success: true,
      insertedCount,
      duplicatesCount,
      totalProcessed: insertedCount + duplicatesCount,
      details,
      skippedDuplicates,
    };
  }
}
