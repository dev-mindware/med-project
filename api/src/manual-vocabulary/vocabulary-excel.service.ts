import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ManualVocabularyWorkbookData } from './manual-vocabulary.types';

type ColumnConfig = {
  label: string;
  key: string;
  width: number;
};

// ─── Paleta de cores ─────────────────────────────────────────────────────────
const PRIMARY      = '2563EB'; // azul cabeçalho
const PRIMARY_DARK = '1D4ED8';
const PRIMARY_SOFT = 'DBEAFE'; // linhas pares
const BORDER       = 'BFDBFE';
const TEXT         = '1E293B';
const WARN_BG      = 'FEF3C7'; // amarelo — confiança 0.5–0.69
const LOW_BG       = 'FEE2E2'; // vermelho suave — confiança < 0.5 (não deve chegar aqui)

// ─── Colunas por modelo ───────────────────────────────────────────────────────

const ENTRY_COLUMNS: ColumnConfig[] = [
  { label: 'Entrada*',              key: 'entry',                  width: 28 },
  { label: 'Tipo de palavra*',      key: 'wordType',               width: 24 },
  { label: 'Primeira definição*',   key: 'firstDefinition',        width: 46 },
  { label: 'Segunda definição',     key: 'secondDefinition',       width: 40 },
  { label: 'Terceira definição',    key: 'thirdDefinition',        width: 40 },
  { label: 'Pronúncia',            key: 'pronunciation',           width: 18 },
  { label: 'Divisão silábica',      key: 'syllabicDivision',       width: 18 },
  { label: 'Etimologia',            key: 'etymology',              width: 28 },
  { label: 'Exemplo de uso',        key: 'usageExample',           width: 40 },
  { label: 'Cat. gramatical',       key: 'grammaticalCategory',    width: 22 },
  { label: 'Subcat. gramatical',    key: 'grammaticalSubcategory', width: 24 },
  { label: 'Estado gramatical',     key: 'grammaticalStatus',      width: 18 },
  { label: 'Código de língua',      key: 'languageCode',           width: 16 },
  { label: 'É VONALP?',             key: 'isVocabulary',           width: 14 },
  { label: 'É VONALP-EP?',          key: 'isVocabularyEP',         width: 14 },
  { label: 'É estrangeirismo?',     key: 'isForeignism',           width: 16 },
  { label: 'Confiança IA',          key: 'confidence',             width: 14 },
];

const TOPONYM_COLUMNS: ColumnConfig[] = [
  { label: 'Topónimo*',             key: 'toponym',                width: 28 },
  { label: 'Província*',            key: 'province',               width: 22 },
  { label: 'Município',             key: 'municipality',           width: 22 },
  { label: 'Significado',           key: 'meaning',                width: 42 },
  { label: 'Pronúncia',            key: 'pronunciation',           width: 18 },
  { label: 'Localização',           key: 'location',               width: 28 },
  { label: 'Gentílico',             key: 'gentilic',               width: 20 },
  { label: 'História',              key: 'toponymHistory',         width: 42 },
  { label: 'Proveniência',          key: 'toponymProvenance',      width: 36 },
  { label: 'Uso comum',             key: 'commonUsage',            width: 34 },
  { label: 'Variação gráfica',      key: 'graphicVariation',       width: 28 },
  { label: 'Classes',               key: 'toponymClasses',         width: 28 },
  { label: 'Subclasses',            key: 'toponymSubclasses',      width: 28 },
  { label: 'Código de língua',      key: 'languageCode',           width: 16 },
  { label: 'É VONALP?',             key: 'isVocabulary',           width: 14 },
  { label: 'É VONALP-EP?',          key: 'isVocabularyEP',         width: 14 },
  { label: 'É estrangeirismo?',     key: 'isForeignism',           width: 16 },
  { label: 'Confiança IA',          key: 'confidence',             width: 14 },
];

const ANTHROPONYM_COLUMNS: ColumnConfig[] = [
  { label: 'Nome próprio*',                 key: 'name',                     width: 28 },
  { label: 'Género',                        key: 'gender',                   width: 18 },
  { label: 'Significado do nome',           key: 'meaning',                  width: 42 },
  { label: 'Etimologia',                    key: 'etymology',                width: 34 },
  { label: 'Apelido',                       key: 'surname',                  width: 24 },
  { label: 'Significado do apelido',        key: 'surnameMeaning',           width: 42 },
  { label: 'Figura histórica',              key: 'historicalFigure',         width: 28 },
  { label: 'Pseudónimo',                    key: 'historicalFigurePseudonym',width: 24 },
  { label: 'Domínio de actuação',           key: 'historicalFigureDomain',   width: 28 },
  { label: 'É VONALP?',                     key: 'isVocabulary',             width: 14 },
  { label: 'É VONALP-EP?',                  key: 'isVocabularyEP',           width: 14 },
  { label: 'É estrangeirismo?',             key: 'isForeignism',             width: 16 },
  { label: 'Confiança IA',                  key: 'confidence',               width: 14 },
];

const FOREIGNISM_COLUMNS: ColumnConfig[] = [
  { label: 'Vocábulo estrangeiro*', key: 'term',                 width: 28 },
  { label: 'Nível de integração',   key: 'integrationLevel',     width: 20 },
  { label: 'Definição',             key: 'definition',           width: 44 },
  { label: 'Significado',           key: 'meaning',              width: 38 },
  { label: 'Pronúncia',            key: 'pronunciation',         width: 18 },
  { label: 'Idioma original',       key: 'originalLanguage',     width: 22 },
  { label: 'País de origem',        key: 'originCountry',        width: 22 },
  { label: 'Forma adaptada',        key: 'adaptedForm',          width: 24 },
  { label: 'Forma original',        key: 'originalForm',         width: 24 },
  { label: 'Exemplo de uso',        key: 'usageExample',         width: 40 },
  { label: 'Contexto',              key: 'context',              width: 30 },
  { label: 'Área de conhecimento',  key: 'field',                width: 26 },
  { label: 'Cat. gramatical',       key: 'grammaticalCategory',  width: 22 },
  { label: 'É VONALP?',             key: 'isVocabulary',         width: 14 },
  { label: 'É VONALP-EP?',          key: 'isVocabularyEP',       width: 14 },
  { label: 'Confiança IA',          key: 'confidence',           width: 14 },
];

@Injectable()
export class VocabularyExcelService {
  async generate(data: ManualVocabularyWorkbookData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MedProject — Sistema de Leitura de Manuais (AO45)';
    workbook.created = new Date();

    this.addSummary(workbook, data);
    this.addDataSheet(workbook, 'Entradas',       ENTRY_COLUMNS,       data.entries);
    this.addDataSheet(workbook, 'Neologismos',    ENTRY_COLUMNS,       data.neologisms);
    this.addDataSheet(workbook, 'Topónimos',      TOPONYM_COLUMNS,     data.toponyms);
    this.addDataSheet(workbook, 'Antropónimos',   ANTHROPONYM_COLUMNS, data.anthroponyms);
    this.addDataSheet(workbook, 'Estrangeirismos',FOREIGNISM_COLUMNS,  data.foreignisms);
    this.addWarnings(workbook, data);
    this.addInstructions(workbook);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // ─── Folha de Resumo ──────────────────────────────────────────────────────

  private addSummary(
    workbook: ExcelJS.Workbook,
    data: ManualVocabularyWorkbookData,
  ) {
    const sheet = workbook.addWorksheet('Resumo', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });
    sheet.columns = [
      { header: 'Métrica', key: 'metric', width: 34 },
      { header: 'Valor',   key: 'value',  width: 18 },
    ];
    this.styleHeader(sheet);

    [
      ['Total extraído pela IA',               data.stats.totalTerms],
      ['Descartados (confiança baixa)',         data.stats.lowConfidenceDiscarded],
      ['Linhas válidas',                        data.stats.validRows],
      ['Entradas',                              data.stats.entries],
      ['Neologismos',                           data.stats.neologisms],
      ['Topónimos',                             data.stats.toponyms],
      ['Antropónimos',                          data.stats.anthroponyms],
      ['Estrangeirismos',                       data.stats.foreignisms],
      ['Avisos (campos em falta)',               data.stats.warnings],
      ['Duplicados removidos',                  data.stats.duplicatesRemoved],
    ].forEach(([metric, value]) => sheet.addRow({ metric, value }));

    this.styleRows(sheet);
  }

  // ─── Folha de dados com formatação condicional por confiança ─────────────

  private addDataSheet(
    workbook: ExcelJS.Workbook,
    name: string,
    columns: ColumnConfig[],
    rows: Record<string, unknown>[],
  ) {
    const sheet = workbook.addWorksheet(name, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });
    sheet.columns = columns.map((col) => ({
      header: col.label,
      key: col.key,
      width: col.width,
    }));
    this.styleHeader(sheet);

    rows.forEach((row) => {
      const excelRow = sheet.addRow(
        Object.fromEntries(
          columns.map((col) => [
            col.key,
            Array.isArray(row[col.key])
              ? (row[col.key] as unknown[]).join('; ')
              : (row[col.key] ?? ''),
          ]),
        ),
      );

      // Formatação condicional por nível de confiança
      const confidence = Number(row['confidence'] ?? 1);
      if (confidence < 0.5) {
        // Nunca deve chegar aqui (filtrado na IA), mas protege por segurança
        excelRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LOW_BG } };
        });
      } else if (confidence < 0.7) {
        // Confiança moderada: fundo amarelo-âmbar para revisão atenta
        excelRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARN_BG } };
        });
      }
    });

    this.styleRows(sheet);
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to:   { row: 1, column: columns.length },
    };
  }

  // ─── Folha de Avisos ──────────────────────────────────────────────────────

  private addWarnings(
    workbook: ExcelJS.Workbook,
    data: ManualVocabularyWorkbookData,
  ) {
    const sheet = workbook.addWorksheet('Avisos', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });
    sheet.columns = [
      { header: 'Modelo',   key: 'sourceModel', width: 18 },
      { header: 'Linha',    key: 'rowNumber',   width: 12 },
      { header: 'Campo',    key: 'field',       width: 26 },
      { header: 'Vocábulo', key: 'term',        width: 32 },
      { header: 'Mensagem', key: 'message',     width: 54 },
    ];
    this.styleHeader(sheet);
    data.warnings.forEach((warning) => sheet.addRow(warning));
    this.styleRows(sheet);
  }

  // ─── Folha de Instruções ──────────────────────────────────────────────────

  private addInstructions(workbook: ExcelJS.Workbook) {
    const sheet = workbook.addWorksheet('Instruções');
    sheet.columns = [{ header: 'Instrução', key: 'instruction', width: 120 }];
    this.styleHeader(sheet);
    [
      '═══════════ ACORDO ORTOGRÁFICO DE 1945 ═══════════',
      'Este ficheiro foi gerado segundo a norma do Acordo Ortográfico de 1945, usado em Angola.',
      'Grafias como "acção", "óptimo", "facto" são CORRECTAS nesta norma (não usar AO90 nem brasileirismos).',
      '',
      '═══════════ REVISÃO DOS DADOS ═══════════',
      'Reveja todos os dados extraídos antes de importar para a base.',
      'Linhas com fundo AMARELO têm confiança da IA entre 0.5 e 0.69 — reveja com atenção redobrada.',
      'A folha "Avisos" lista campos obrigatórios em falta e outros problemas detectados.',
      '',
      '═══════════ TIPOS DE PALAVRA (coluna "Tipo de palavra") ═══════════',
      'simples           → palavra não composta (ex: casa, terra, musseque)',
      'composto-hifenizado → justaposição com hífen (ex: couve-flor, guarda-chuva)',
      'aglutinado        → composto fundido (ex: girassol, pontapé, vaivém)',
      'especie-botanica  → nome de planta com hífen obrigatório (ex: erva-doce)',
      'especie-zoologica → nome de animal com hífen obrigatório (ex: bem-te-vi)',
      'locucao-nominal   → grupo de palavras com função de substantivo (ex: fim de semana)',
      'locucao-adverbial → grupo de palavras com função de advérbio (ex: de repente)',
      'prefixado         → derivação com prefixo e hífen (ex: pré-natal, ex-marido)',
      'bantuismo         → origem em língua bantu angolana (ex: musseque, ginguba)',
      'angolanismo       → sentido ou forma particular do português angolano',
      '',
      '═══════════ IMPORTAÇÃO ═══════════',
      'Campos marcados com * são obrigatórios no importador.',
      'Valores de listas devem ser separados por ponto e vírgula.',
      'Booleanos aceites pelo importador: Sim, Não, true, false, 1, 0.',
      'Use cada folha para importar o módulo correspondente no ecrã VONALP.',
      'Limite por importação: 5000 linhas por pedido.',
    ].forEach((instruction) => sheet.addRow({ instruction }));
    this.styleRows(sheet);
  }

  // ─── Estilos ──────────────────────────────────────────────────────────────

  private styleHeader(sheet: ExcelJS.Worksheet) {
    const row = sheet.getRow(1);
    row.height = 26;
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: PRIMARY },
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: PRIMARY_DARK } },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
  }

  private styleRows(sheet: ExcelJS.Worksheet) {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        // Não sobrescrever fill de confiança já aplicado
        if (!cell.fill || (cell.fill as ExcelJS.FillPattern).fgColor?.argb === undefined) {
          if (rowNumber % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: PRIMARY_SOFT },
            };
          }
        }
        cell.font = { color: { argb: TEXT } };
        cell.alignment = { vertical: 'top', wrapText: true };
        cell.border = {
          top:    { style: 'thin', color: { argb: BORDER } },
          bottom: { style: 'thin', color: { argb: BORDER } },
        };
      });
    });
  }

  // ─── Leitura e Parse de Ficheiro Excel (.xlsx) ───────────────────────────

  async parse(buffer: Buffer): Promise<ManualVocabularyWorkbookData> {
    const workbook = new ExcelJS.Workbook();
    // @ts-expect-error exceljs types buffer
    await workbook.xlsx.load(buffer);

    const entries: Record<string, unknown>[] = [];
    const neologisms: Record<string, unknown>[] = [];
    const toponyms: Record<string, unknown>[] = [];
    const anthroponyms: Record<string, unknown>[] = [];
    const foreignisms: Record<string, unknown>[] = [];
    const warnings: import('./manual-vocabulary.types').ManualVocabularyWarning[] = [];

    const normalizeHeader = (h: string): string =>
      h
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

    const parseSheetRows = (
      sheet: ExcelJS.Worksheet,
      columnConfigs: ColumnConfig[],
    ) => {
      const headerRow = sheet.getRow(1);
      const colMap = new Map<number, string>();

      headerRow.eachCell((cell, colNumber) => {
        const val = this.extractCellValue(cell);
        const norm = normalizeHeader(val);
        for (const col of columnConfigs) {
          if (
            normalizeHeader(col.label) === norm ||
            normalizeHeader(col.key) === norm ||
            norm.includes(normalizeHeader(col.key))
          ) {
            colMap.set(colNumber, col.key);
            break;
          }
        }
        if (!colMap.has(colNumber)) {
          if (
            norm.includes('entrada') ||
            norm.includes('vocabulo') ||
            norm.includes('palavra')
          ) {
            colMap.set(colNumber, 'entry');
          } else if (norm.includes('toponimo')) {
            colMap.set(colNumber, 'toponym');
          } else if (norm.includes('nome')) {
            colMap.set(colNumber, 'name');
          } else if (norm.includes('termo')) {
            colMap.set(colNumber, 'term');
          } else if (
            norm.includes('primeiradefinicao') ||
            norm.includes('definicao')
          ) {
            colMap.set(colNumber, 'firstDefinition');
          } else if (norm.includes('provincia')) {
            colMap.set(colNumber, 'province');
          }
        }
      });

      const rows: Record<string, unknown>[] = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const item: Record<string, unknown> = {};
        let hasData = false;

        row.eachCell((cell, colNumber) => {
          const key = colMap.get(colNumber);
          if (!key) return;
          const val = this.extractCellValue(cell);
          if (val) {
            hasData = true;
            if (['isVocabulary', 'isVocabularyEP', 'isForeignism'].includes(key)) {
              item[key] = ['true', 'sim', '1', 's'].includes(val.toLowerCase());
            } else if (key === 'confidence') {
              const num = parseFloat(val);
              item[key] = isNaN(num) ? 1 : num;
            } else if (['toponymClasses', 'toponymSubclasses'].includes(key)) {
              item[key] = val
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter(Boolean);
            } else {
              item[key] = val;
            }
          }
        });

        if (hasData) {
          rows.push(item);
        }
      });

      return rows;
    };

    const entriesSheet = workbook.getWorksheet('Entradas');
    if (entriesSheet) entries.push(...parseSheetRows(entriesSheet, ENTRY_COLUMNS));

    const neologismsSheet = workbook.getWorksheet('Neologismos');
    if (neologismsSheet) neologisms.push(...parseSheetRows(neologismsSheet, ENTRY_COLUMNS));

    const toponymsSheet =
      workbook.getWorksheet('Topónimos') || workbook.getWorksheet('Toponimos');
    if (toponymsSheet) toponyms.push(...parseSheetRows(toponymsSheet, TOPONYM_COLUMNS));

    const anthroponymsSheet =
      workbook.getWorksheet('Antropónimos') || workbook.getWorksheet('Antroponimos');
    if (anthroponymsSheet) anthroponyms.push(...parseSheetRows(anthroponymsSheet, ANTHROPONYM_COLUMNS));

    const foreignismsSheet = workbook.getWorksheet('Estrangeirismos');
    if (foreignismsSheet) foreignisms.push(...parseSheetRows(foreignismsSheet, FOREIGNISM_COLUMNS));

    // Fallback se o ficheiro tiver apenas a primeira folha sem nomes específicos
    if (
      entries.length === 0 &&
      neologisms.length === 0 &&
      toponyms.length === 0 &&
      anthroponyms.length === 0 &&
      foreignisms.length === 0
    ) {
      const firstSheet = workbook.worksheets[0];
      if (firstSheet) {
        entries.push(...parseSheetRows(firstSheet, ENTRY_COLUMNS));
      }
    }

    const totalTerms =
      entries.length +
      neologisms.length +
      toponyms.length +
      anthroponyms.length +
      foreignisms.length;

    const stats = {
      totalTerms,
      validRows: totalTerms,
      entries: entries.length,
      neologisms: neologisms.length,
      toponyms: toponyms.length,
      anthroponyms: anthroponyms.length,
      foreignisms: foreignisms.length,
      warnings: warnings.length,
      duplicatesRemoved: 0,
      lowConfidenceDiscarded: 0,
    };

    return {
      entries,
      neologisms,
      toponyms,
      anthroponyms,
      foreignisms,
      warnings,
      stats,
    };
  }

  private extractCellValue(cell: ExcelJS.Cell): string {
    if (cell.value === null || cell.value === undefined) return '';
    if (typeof cell.value === 'object') {
      if ('text' in cell.value && typeof (cell.value as any).text === 'string') {
        return (cell.value as any).text.trim();
      }
      if ('result' in cell.value) {
        return String((cell.value as any).result ?? '').trim();
      }
    }
    return String(cell.value).trim();
  }
}
