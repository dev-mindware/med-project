import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { ManualVocabularyController } from './manual-vocabulary.controller';
import { ManualVocabularyService } from './manual-vocabulary.service';

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
      service as unknown as ManualVocabularyService,
      { get: jest.fn().mockReturnValue(20) } as unknown as ConfigService,
    );
  });

  it('rejects non-PDF files', async () => {
    const response = mockResponse();
    const file = { mimetype: 'image/png', size: 1000, buffer: Buffer.from('not-pdf') } as Express.Multer.File;

    await expect(controller.extract(file, {}, {}, response as Response)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a fake PDF with an incorrect signature', async () => {
    const response = mockResponse();
    const file = { mimetype: 'application/pdf', size: 1000, buffer: Buffer.from('not-pdf') } as Express.Multer.File;
    await expect(controller.extract(file, {}, {}, response as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an oversized PDF', async () => {
    const response = mockResponse();
    const file = { mimetype: 'application/pdf', size: 21 * 1024 * 1024, buffer: Buffer.from('%PDF-1.7\nvalid\n%%EOF') } as Express.Multer.File;
    await expect(controller.extract(file, {}, {}, response as any)).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it('sets Excel response headers', async () => {
    const response = mockResponse();
    const file = { mimetype: 'application/pdf', size: 1000, buffer: Buffer.from('%PDF-1.7\nvalid\n%%EOF') } as Express.Multer.File;

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
