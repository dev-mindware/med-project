import * as ExcelJS from 'exceljs';
import { VocabularyExcelService } from './vocabulary-excel.service';

describe('VocabularyExcelService', () => {
  let service: VocabularyExcelService;

  beforeEach(() => {
    service = new VocabularyExcelService();
  });

  it('generates a workbook with all expected sheets', async () => {
    const buffer = await service.generate({
      entries: [{ entry: 'Casa', firstDefinition: 'Habitacao' }],
      toponyms: [{ toponym: 'Luanda', province: 'Luanda' }],
      anthroponyms: [{ name: 'Kiala' }],
      foreignisms: [{ term: 'online' }],
      warnings: [],
      stats: {
        totalTerms: 4,
        validRows: 4,
        entries: 1,
        toponyms: 1,
        anthroponyms: 1,
        foreignisms: 1,
        warnings: 0,
        duplicatesRemoved: 0,
      },
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'Resumo',
      'Entradas',
      'Topónimos',
      'Antropónimos',
      'Estrangeirismos',
      'Avisos',
      'Instruções',
    ]);
  });
});
