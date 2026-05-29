import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManualVocabularyController } from './manual-vocabulary.controller';

describe('ManualVocabularyController', () => {
  let controller: ManualVocabularyController;
  let service: { extract: jest.Mock };

  beforeEach(() => {
    service = {
      extract: jest.fn().mockResolvedValue({
        buffer: Buffer.from('xlsx'),
        filename: 'vocabulario_manual.xlsx',
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
      }),
    };

    controller = new ManualVocabularyController(
      service as any,
      { get: jest.fn().mockReturnValue('50') } as unknown as ConfigService,
    );
  });

  it('rejects non-PDF files', async () => {
    const response = mockResponse();
    const file = { mimetype: 'image/png', size: 1000 } as Express.Multer.File;

    await expect(controller.extract(file, {}, {}, response as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sets Excel response headers', async () => {
    const response = mockResponse();
    const file = { mimetype: 'application/pdf', size: 1000 } as Express.Multer.File;

    await controller.extract(file, {}, {}, response as any);

    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.setHeader).toHaveBeenCalledWith('X-Total-Terms', '1');
    expect(response.send).toHaveBeenCalledWith(Buffer.from('xlsx'));
  });
});

function mockResponse() {
  return {
    setHeader: jest.fn(),
    send: jest.fn(),
  };
}
