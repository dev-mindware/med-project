import { Injectable } from '@nestjs/common';
import {
  ManualVocabularyRawItem,
  ManualVocabularySourceModel,
  ManualVocabularyWarning,
  ManualVocabularyWorkbookData,
} from './manual-vocabulary.types';

/**
 * Campos obrigatórios por modelo.
 * A ausência de qualquer um destes campos gera um aviso de nível ERRO.
 */
const REQUIRED_FIELDS: Record<ManualVocabularySourceModel, string[]> = {
  ENTRY: ['entry', 'firstDefinition'],
  NEOLOGISM: ['entry', 'firstDefinition'],
  TOPONYM: ['toponym', 'province'],
  ANTHROPONYM: ['name'],
  FOREIGNISM: ['term'],
};

/**
 * Campo que identifica o termo principal de cada modelo.
 * Usado para deduplicação e avisos.
 */
const TERM_FIELD: Record<ManualVocabularySourceModel, string> = {
  ENTRY: 'entry',
  NEOLOGISM: 'entry',
  TOPONYM: 'toponym',
  ANTHROPONYM: 'name',
  FOREIGNISM: 'term',
};

/**
 * Campos recomendados por modelo.
 * A ausência gera um aviso de nível AVISO (não bloqueia a entrada).
 */
const RECOMMENDED_FIELDS: Record<ManualVocabularySourceModel, string[]> = {
  ENTRY: [
    'pronunciation',
    'syllabicDivision',
    'grammaticalCategory',
    'wordType',
  ],
  NEOLOGISM: [
    'pronunciation',
    'syllabicDivision',
    'grammaticalCategory',
    'wordType',
  ],
  TOPONYM: ['meaning', 'municipality', 'gentilic'],
  ANTHROPONYM: ['meaning', 'gender', 'etymology'],
  FOREIGNISM: ['definition', 'originalLanguage', 'field', 'integrationLevel'],
};

/**
 * Limites de tokens lexicais (palavras separadas por espaço) por modelo.
 * Compostos hifenizados contam como 1 token lexical.
 * Ex: "couve-flor" = 1 token | "fim de semana" = 3 tokens
 */
const TERM_TOKEN_LIMITS: Record<
  ManualVocabularySourceModel,
  { min: number; max: number }
> = {
  ENTRY: { min: 1, max: 3 },
  NEOLOGISM: { min: 1, max: 4 },
  TOPONYM: { min: 1, max: 5 }, // topónimos compostos podem ter mais tokens
  ANTHROPONYM: { min: 1, max: 4 },
  FOREIGNISM: { min: 1, max: 4 },
};

@Injectable()
export class VocabularyProcessorService {
  process(
    items: ManualVocabularyRawItem[],
    selectedModules?: ManualVocabularySourceModel[],
  ): ManualVocabularyWorkbookData {
    const grouped = {
      entries: [] as Record<string, unknown>[],
      neologisms: [] as Record<string, unknown>[],
      toponyms: [] as Record<string, unknown>[],
      anthroponyms: [] as Record<string, unknown>[],
      foreignisms: [] as Record<string, unknown>[],
    };
    const warnings: ManualVocabularyWarning[] = [];
    const seen = new Set<string>();
    let duplicatesRemoved = 0;

    const filteredItems =
      selectedModules && selectedModules.length > 0
        ? items.filter((item) => selectedModules.includes(item.sourceModel))
        : items;

    for (const item of filteredItems) {
      const sourceModel = item.sourceModel;
      const data: Record<string, unknown> = this.normalize(
        sourceModel,
        item.data,
      );
      const rawTerm = data[TERM_FIELD[sourceModel]];
      const term =
        typeof rawTerm === 'string' || typeof rawTerm === 'number'
          ? String(rawTerm).trim()
          : '';
      const rowNumber = this.bucket(sourceModel, grouped).length + 2;

      // Validação de tamanho do termo (conta tokens lexicais, não caracteres)
      if (!term || !this.isValidTerm(sourceModel, term)) {
        warnings.push({
          sourceModel,
          rowNumber,
          term,
          message:
            'Vocábulo ausente ou com número de tokens fora dos limites admitidos',
        });
        continue;
      }

      // Deduplicação normalizada (ignora diferenças de capitalização, acentos e hífens)
      const dedupeKey = `${sourceModel}:${this.normalizeForDedup(term)}`;
      if (seen.has(dedupeKey)) {
        duplicatesRemoved += 1;
        continue;
      }
      seen.add(dedupeKey);

      // Avisos por campos obrigatórios em falta
      for (const field of REQUIRED_FIELDS[sourceModel]) {
        if (this.isEmpty(data[field])) {
          warnings.push({
            sourceModel,
            rowNumber,
            field,
            term,
            message: 'Campo obrigatorio ausente',
          });
        }
      }

      // Avisos por campos recomendados em falta
      for (const field of RECOMMENDED_FIELDS[sourceModel]) {
        if (this.isEmpty(data[field])) {
          warnings.push({
            sourceModel,
            rowNumber,
            field,
            term,
            message: 'Campo recomendado ausente',
          });
        }
      }

      this.bucket(sourceModel, grouped).push(data);
    }

    const validRows =
      grouped.entries.length +
      grouped.neologisms.length +
      grouped.toponyms.length +
      grouped.anthroponyms.length +
      grouped.foreignisms.length;

    return {
      ...grouped,
      warnings,
      stats: {
        totalTerms: filteredItems.length,
        validRows,
        entries: grouped.entries.length,
        neologisms: grouped.neologisms.length,
        toponyms: grouped.toponyms.length,
        anthroponyms: grouped.anthroponyms.length,
        foreignisms: grouped.foreignisms.length,
        warnings: warnings.length,
        duplicatesRemoved,
        lowConfidenceDiscarded: 0, // descartados antes de chegar aqui (no VocabularyAiService)
      },
    };
  }

  // ─── Normalização de dados ──────────────────────────────────────────────

  private normalize(
    sourceModel: ManualVocabularySourceModel,
    data: Record<string, unknown>,
  ) {
    const normalized = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        this.normalizeValue(value),
      ]),
    );

    // Defaults por modelo
    if (sourceModel === 'ENTRY' || sourceModel === 'NEOLOGISM') {
      return {
        wordType: 'simples',
        isVocabulary: false,
        isVocabularyEP: false,
        isForeignism: false,
        languageCode: 'pt-PT',
        ...normalized,
      };
    }

    if (sourceModel === 'TOPONYM') {
      return {
        toponymClasses: [],
        toponymSubclasses: [],
        isVocabulary: false,
        isVocabularyEP: false,
        isForeignism: false,
        languageCode: 'pt-PT',
        ...normalized,
      };
    }

    if (sourceModel === 'ANTHROPONYM') {
      return {
        isVocabulary: false,
        isVocabularyEP: false,
        isForeignism: false,
        ...normalized,
      };
    }

    // FOREIGNISM
    return {
      isVocabulary: false,
      isVocabularyEP: false,
      integrationLevel: 'nao-adaptado',
      ...normalized,
    };
  }

  private normalizeValue(value: unknown): unknown {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value))
      return value.map((item) => String(item).trim()).filter(Boolean);
    if (value === null || value === undefined) return '';
    return value;
  }

  // ─── Validação do termo ─────────────────────────────────────────────────

  /**
   * Valida o número de tokens lexicais do termo.
   *
   * Regra AO45: compostos hifenizados contam como 1 token lexical.
   * Ex: "couve-flor" → 1 token (válido para ENTRY)
   *     "fim de semana" → 3 tokens (válido para ENTRY)
   *     "segunda-feira de manhã cedo" → 4 tokens (inválido para ENTRY)
   *
   * O hífen dentro de uma palavra NÃO é tratado como separador de token.
   */
  private isValidTerm(
    sourceModel: ManualVocabularySourceModel,
    term: string,
  ): boolean {
    const trimmed = term.trim();
    if (trimmed.length === 0) return false;

    // Contar tokens separados por espaço (hífens não separam tokens)
    const spaceTokens = trimmed.split(/\s+/).filter(Boolean).length;
    const { min, max } = TERM_TOKEN_LIMITS[sourceModel];
    return spaceTokens >= min && spaceTokens <= max;
  }

  /**
   * Normaliza um termo para comparação de deduplicação.
   * Remove acentos, hífens, espaços e maiúsculas para que
   * "Couve-flor", "couve flor" e "couveflor" sejam tratados como iguais.
   */
  private normalizeForDedup(term: string): string {
    return term
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
      .replace(/[-\s]+/g, ''); // remove hífens E espaços
  }

  // ─── Utilitários ───────────────────────────────────────────────────────

  private isEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  private bucket(
    sourceModel: ManualVocabularySourceModel,
    grouped: Pick<
      ManualVocabularyWorkbookData,
      'entries' | 'neologisms' | 'toponyms' | 'anthroponyms' | 'foreignisms'
    >,
  ) {
    if (sourceModel === 'ENTRY') return grouped.entries;
    if (sourceModel === 'NEOLOGISM') return grouped.neologisms;
    if (sourceModel === 'TOPONYM') return grouped.toponyms;
    if (sourceModel === 'ANTHROPONYM') return grouped.anthroponyms;
    return grouped.foreignisms;
  }
}
