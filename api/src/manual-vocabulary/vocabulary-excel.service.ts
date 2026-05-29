import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ManualVocabularyWorkbookData } from './manual-vocabulary.types';

type ColumnConfig = {
  label: string;
  key: string;
  width: number;
};

const PRIMARY = '2563EB';
const PRIMARY_DARK = '1D4ED8';
const PRIMARY_SOFT = 'DBEAFE';
const BORDER = 'BFDBFE';
const TEXT = '1E293B';

const ENTRY_COLUMNS: ColumnConfig[] = [
  { label: 'Entrada*', key: 'entry', width: 28 },
  { label: 'Primeira definição*', key: 'firstDefinition', width: 46 },
  { label: 'Pronúncia', key: 'pronunciation', width: 18 },
  { label: 'Divisão silábica', key: 'syllabicDivision', width: 18 },
  { label: 'Etimologia', key: 'etymology', width: 28 },
  { label: 'Segunda definição', key: 'secondDefinition', width: 40 },
  { label: 'Terceira definição', key: 'thirdDefinition', width: 40 },
  { label: 'Exemplo de uso', key: 'usageExample', width: 40 },
  { label: 'Categoria gramatical', key: 'grammaticalCategory', width: 24 },
  { label: 'Subcategoria gramatical', key: 'grammaticalSubcategory', width: 28 },
  { label: 'Código da língua', key: 'languageCode', width: 18 },
  { label: 'É VONALP?', key: 'isVocabulary', width: 16 },
  { label: 'É VONALP EP?', key: 'isVocabularyEP', width: 16 },
  { label: 'É estrangeirismo?', key: 'isForeignism', width: 18 },
];

const TOPONYM_COLUMNS: ColumnConfig[] = [
  { label: 'Topónimo*', key: 'toponym', width: 28 },
  { label: 'Província*', key: 'province', width: 22 },
  { label: 'Município', key: 'municipality', width: 22 },
  { label: 'Significado', key: 'meaning', width: 42 },
  { label: 'Pronúncia', key: 'pronunciation', width: 18 },
  { label: 'Localização', key: 'location', width: 28 },
  { label: 'Gentílico', key: 'gentilic', width: 20 },
  { label: 'História', key: 'toponymHistory', width: 42 },
  { label: 'Proveniência', key: 'toponymProvenance', width: 36 },
  { label: 'Uso comum', key: 'commonUsage', width: 34 },
  { label: 'Variação gráfica', key: 'graphicVariation', width: 28 },
  { label: 'Classes', key: 'toponymClasses', width: 28 },
  { label: 'Subclasses', key: 'toponymSubclasses', width: 28 },
  { label: 'Código da língua', key: 'languageCode', width: 18 },
  { label: 'É VONALP?', key: 'isVocabulary', width: 16 },
  { label: 'É VONALP EP?', key: 'isVocabularyEP', width: 16 },
  { label: 'É estrangeirismo?', key: 'isForeignism', width: 18 },
];

const ANTHROPONYM_COLUMNS: ColumnConfig[] = [
  { label: 'Nome próprio*', key: 'name', width: 28 },
  { label: 'Género', key: 'gender', width: 18 },
  { label: 'Significado do nome', key: 'meaning', width: 42 },
  { label: 'Etimologia', key: 'etymology', width: 34 },
  { label: 'Apelido', key: 'surname', width: 24 },
  { label: 'Significado do apelido', key: 'surnameMeaning', width: 42 },
  { label: 'Figura histórica', key: 'historicalFigure', width: 28 },
  { label: 'Pseudónimo', key: 'historicalFigurePseudonym', width: 24 },
  { label: 'Domínio de atuação', key: 'historicalFigureDomain', width: 28 },
  { label: 'É VONALP?', key: 'isVocabulary', width: 16 },
  { label: 'É VONALP EP?', key: 'isVocabularyEP', width: 16 },
  { label: 'É estrangeirismo?', key: 'isForeignism', width: 18 },
];

const FOREIGNISM_COLUMNS: ColumnConfig[] = [
  { label: 'Termo estrangeiro*', key: 'term', width: 28 },
  { label: 'Definição', key: 'definition', width: 44 },
  { label: 'Significado', key: 'meaning', width: 38 },
  { label: 'Pronúncia', key: 'pronunciation', width: 18 },
  { label: 'Idioma original', key: 'originalLanguage', width: 22 },
  { label: 'País de origem', key: 'originCountry', width: 22 },
  { label: 'Forma adaptada', key: 'adaptedForm', width: 24 },
  { label: 'Forma original', key: 'originalForm', width: 24 },
  { label: 'Exemplo de uso', key: 'usageExample', width: 40 },
  { label: 'Contexto', key: 'context', width: 30 },
  { label: 'Área de conhecimento', key: 'field', width: 26 },
  { label: 'Categoria gramatical', key: 'grammaticalCategory', width: 24 },
  { label: 'É VONALP?', key: 'isVocabulary', width: 16 },
  { label: 'É VONALP EP?', key: 'isVocabularyEP', width: 16 },
];

@Injectable()
export class VocabularyExcelService {
  async generate(data: ManualVocabularyWorkbookData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MedProject';
    workbook.created = new Date();

    this.addSummary(workbook, data);
    this.addDataSheet(workbook, 'Entradas', ENTRY_COLUMNS, data.entries);
    this.addDataSheet(workbook, 'Topónimos', TOPONYM_COLUMNS, data.toponyms);
    this.addDataSheet(workbook, 'Antropónimos', ANTHROPONYM_COLUMNS, data.anthroponyms);
    this.addDataSheet(workbook, 'Estrangeirismos', FOREIGNISM_COLUMNS, data.foreignisms);
    this.addWarnings(workbook, data);
    this.addInstructions(workbook);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private addSummary(workbook: ExcelJS.Workbook, data: ManualVocabularyWorkbookData) {
    const sheet = workbook.addWorksheet('Resumo', { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = [
      { header: 'Métrica', key: 'metric', width: 32 },
      { header: 'Valor', key: 'value', width: 18 },
    ];
    this.styleHeader(sheet);
    [
      ['Total extraído', data.stats.totalTerms],
      ['Linhas válidas', data.stats.validRows],
      ['Entradas', data.stats.entries],
      ['Topónimos', data.stats.toponyms],
      ['Antropónimos', data.stats.anthroponyms],
      ['Estrangeirismos', data.stats.foreignisms],
      ['Avisos', data.stats.warnings],
      ['Duplicados removidos', data.stats.duplicatesRemoved],
    ].forEach(([metric, value]) => sheet.addRow({ metric, value }));
    this.styleRows(sheet);
  }

  private addDataSheet(workbook: ExcelJS.Workbook, name: string, columns: ColumnConfig[], rows: Record<string, unknown>[]) {
    const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = columns.map((column) => ({ header: column.label, key: column.key, width: column.width }));
    this.styleHeader(sheet);

    rows.forEach((row) => {
      sheet.addRow(
        Object.fromEntries(
          columns.map((column) => [column.key, Array.isArray(row[column.key]) ? (row[column.key] as unknown[]).join('; ') : row[column.key] ?? '']),
        ),
      );
    });

    this.styleRows(sheet);
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  }

  private addWarnings(workbook: ExcelJS.Workbook, data: ManualVocabularyWorkbookData) {
    const sheet = workbook.addWorksheet('Avisos', { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = [
      { header: 'Modelo', key: 'sourceModel', width: 18 },
      { header: 'Linha', key: 'rowNumber', width: 12 },
      { header: 'Campo', key: 'field', width: 24 },
      { header: 'Termo', key: 'term', width: 30 },
      { header: 'Mensagem', key: 'message', width: 52 },
    ];
    this.styleHeader(sheet);
    data.warnings.forEach((warning) => sheet.addRow(warning));
    this.styleRows(sheet);
  }

  private addInstructions(workbook: ExcelJS.Workbook) {
    const sheet = workbook.addWorksheet('Instruções');
    sheet.columns = [{ header: 'Instrução', key: 'instruction', width: 110 }];
    this.styleHeader(sheet);
    [
      'Revise os dados extraídos antes de importar para a base.',
      'Campos marcados com * são obrigatórios no importador.',
      'Valores de listas devem ser separados por ponto e vírgula.',
      'Booleanos aceites pelo importador: Sim, Não, true, false, 1, 0.',
      'Use as folhas específicas para importar cada módulo no ecrã VONALP correspondente.',
    ].forEach((instruction) => sheet.addRow({ instruction }));
    this.styleRows(sheet);
  }

  private styleHeader(sheet: ExcelJS.Worksheet) {
    const row = sheet.getRow(1);
    row.height = 24;
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIMARY } };
      cell.border = { bottom: { style: 'thin', color: { argb: PRIMARY_DARK } } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
  }

  private styleRows(sheet: ExcelJS.Worksheet) {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.font = { color: { argb: TEXT } };
        cell.alignment = { vertical: 'top', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: BORDER } },
          bottom: { style: 'thin', color: { argb: BORDER } },
        };
        if (rowNumber % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIMARY_SOFT } };
        }
      });
    });
  }
}
