import { Injectable } from '@nestjs/common';
import {
  ManualVocabularyRawItem,
  ManualVocabularySourceModel,
  ManualVocabularyWarning,
  ManualVocabularyWorkbookData,
} from './manual-vocabulary.types';

const REQUIRED_FIELDS: Record<ManualVocabularySourceModel, string[]> = {
  ENTRY: ['entry', 'firstDefinition'],
  TOPONYM: ['toponym', 'province'],
  ANTHROPONYM: ['name'],
  FOREIGNISM: ['term'],
};

const TERM_FIELD: Record<ManualVocabularySourceModel, string> = {
  ENTRY: 'entry',
  TOPONYM: 'toponym',
  ANTHROPONYM: 'name',
  FOREIGNISM: 'term',
};

const RECOMMENDED_FIELDS: Record<ManualVocabularySourceModel, string[]> = {
  ENTRY: ['pronunciation', 'syllabicDivision', 'grammaticalCategory'],
  TOPONYM: ['meaning', 'municipality', 'gentilic'],
  ANTHROPONYM: ['meaning', 'gender', 'etymology'],
  FOREIGNISM: ['definition', 'originalLanguage', 'field'],
};

@Injectable()
export class VocabularyProcessorService {
  process(items: ManualVocabularyRawItem[]): ManualVocabularyWorkbookData {
    const grouped = {
      entries: [] as Record<string, unknown>[],
      toponyms: [] as Record<string, unknown>[],
      anthroponyms: [] as Record<string, unknown>[],
      foreignisms: [] as Record<string, unknown>[],
    };
    const warnings: ManualVocabularyWarning[] = [];
    const seen = new Set<string>();
    let duplicatesRemoved = 0;

    for (const item of items) {
      const sourceModel = item.sourceModel;
      const data: Record<string, unknown> = this.normalize(sourceModel, item.data);
      const rawTerm = data[TERM_FIELD[sourceModel]];
      const term = typeof rawTerm === 'string' || typeof rawTerm === 'number' ? String(rawTerm).trim() : '';
      const rowNumber = this.bucket(sourceModel, grouped).length + 2;
      const dedupeKey = `${sourceModel}:${term.toLowerCase()}`;

      if (!term || !this.isValidTerm(sourceModel, term)) {
        warnings.push({ sourceModel, rowNumber, term, message: 'Vocábulo ausente ou fora das regras de tamanho' });
        continue;
      }

      if (seen.has(dedupeKey)) {
        duplicatesRemoved += 1;
        continue;
      }
      seen.add(dedupeKey);

      for (const field of REQUIRED_FIELDS[sourceModel]) {
        if (this.isEmpty(data[field])) {
          warnings.push({ sourceModel, rowNumber, field, term, message: 'Campo obrigatorio ausente' });
        }
      }

      for (const field of RECOMMENDED_FIELDS[sourceModel]) {
        if (this.isEmpty(data[field])) {
          warnings.push({ sourceModel, rowNumber, field, term, message: 'Campo recomendado ausente' });
        }
      }

      this.bucket(sourceModel, grouped).push(data);
    }

    const validRows = grouped.entries.length + grouped.toponyms.length + grouped.anthroponyms.length + grouped.foreignisms.length;

    return {
      ...grouped,
      warnings,
      stats: {
        totalTerms: items.length,
        validRows,
        entries: grouped.entries.length,
        toponyms: grouped.toponyms.length,
        anthroponyms: grouped.anthroponyms.length,
        foreignisms: grouped.foreignisms.length,
        warnings: warnings.length,
        duplicatesRemoved,
      },
    };
  }

  private normalize(sourceModel: ManualVocabularySourceModel, data: Record<string, unknown>) {
    const normalized = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, this.normalizeValue(value)]),
    );

    if (sourceModel === 'ENTRY') {
      return { isVocabulary: true, isVocabularyEP: false, isForeignism: false, ...normalized };
    }

    if (sourceModel === 'TOPONYM') {
      return {
        toponymClasses: [],
        toponymSubclasses: [],
        isVocabulary: true,
        isVocabularyEP: false,
        isForeignism: false,
        ...normalized,
      };
    }

    if (sourceModel === 'ANTHROPONYM') {
      return { isVocabulary: true, isVocabularyEP: false, isForeignism: false, ...normalized };
    }

    return { isVocabulary: false, isVocabularyEP: false, ...normalized };
  }

  private normalizeValue(value: unknown): unknown {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    if (value === null || value === undefined) return '';
    return value;
  }

  private isValidTerm(sourceModel: ManualVocabularySourceModel, term: string) {
    if (sourceModel !== 'ENTRY') return true;
    const count = term.split(/\s+/).filter(Boolean).length;
    return count >= 1 && count <= 3;
  }

  private isEmpty(value: unknown) {
    return value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);
  }

  private bucket(
    sourceModel: ManualVocabularySourceModel,
    grouped: Pick<ManualVocabularyWorkbookData, 'entries' | 'toponyms' | 'anthroponyms' | 'foreignisms'>,
  ) {
    if (sourceModel === 'ENTRY') return grouped.entries;
    if (sourceModel === 'TOPONYM') return grouped.toponyms;
    if (sourceModel === 'ANTHROPONYM') return grouped.anthroponyms;
    return grouped.foreignisms;
  }
}
