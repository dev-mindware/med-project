import { BadRequestException, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { ManualVocabularyController } from './manual-vocabulary.controller';
import { ManualVocabularyService } from './manual-vocabulary.service';
import { ManualVocabularyLogService } from './manual-vocabulary-log.service';

describe('ManualVocabularyController', () => {
  let controller: ManualVocabularyController;
  let service: { extract: jest.Mock };
  let logService: { findAll: jest.Mock; findById: jest.Mock };

  beforeEach(() => {
    service = {
      extract: jest.fn().mockResolvedValue({
        buffer: Buffer.from('xlsx'),
        filename: 'vocabulario_manual.xlsx',
        stats: {
          totalTerms: 1,
          validRows: 1,
          entries: 1,
          neologisms: 0,
          toponyms: 0,
          anthroponyms: 0,
          foreignisms: 0,
          warnings: 0,
          duplicatesRemoved: 0,
          lowConfidenceDiscarded: 0,
        },
      }),
    };

    logService = {
      findAll: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      findById: jest.fn(),
    };

    controller = new ManualVocabularyController(
      service as unknown as ManualVocabularyService,
      logService as unknown as ManualVocabularyLogService,
      { get: jest.fn().mockReturnValue(20) } as unknown as ConfigService,
    );
  });

  it('rejects non-PDF files', async () => {
    const response = mockResponse();
    const file = {
      mimetype: 'image/png',
      size: 1000,
      buffer: Buffer.from('not-pdf'),
    } as Express.Multer.File;

    await expect(
      controller.extract(file, {} as any, {}, response as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a fake PDF with an incorrect signature', async () => {
    const response = mockResponse();
    const file = {
      mimetype: 'application/pdf',
      size: 1000,
      buffer: Buffer.from('not-pdf'),
    } as Express.Multer.File;
    await expect(
      controller.extract(file, {} as any, {}, response as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an oversized PDF', async () => {
    const response = mockResponse();
    const file = {
      mimetype: 'application/pdf',
      size: 21 * 1024 * 1024,
      buffer: Buffer.from('%PDF-1.7\nvalid\n%%EOF'),
    } as Express.Multer.File;
    await expect(
      controller.extract(file, {} as any, {}, response as any),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it('sets Excel response headers and passes user ID', async () => {
    const response = mockResponse();
    const file = {
      mimetype: 'application/pdf',
      size: 1000,
      buffer: Buffer.from('%PDF-1.7\nvalid\n%%EOF'),
    } as Express.Multer.File;

    await controller.extract(
      file,
      {} as any,
      {},
      response as any,
      { id: 'user-456' },
    );

    expect(service.extract).toHaveBeenCalledWith(file, 'user-456', undefined);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.setHeader).toHaveBeenCalledWith('X-Total-Terms', '1');
    expect(response.send).toHaveBeenCalledWith(Buffer.from('xlsx'));
  });

  it('delegates getLogs query to logService.findAll', async () => {
    logService.findAll.mockResolvedValue({ items: [{ id: 'log-1' }], total: 1 });

    const result = await controller.getLogs('10', '20', 'user-1');

    expect(logService.findAll).toHaveBeenCalledWith({
      skip: 10,
      take: 20,
      userId: 'user-1',
    });
    expect(result).toEqual({ items: [{ id: 'log-1' }], total: 1 });
  });

  it('returns log detail when found by id', async () => {
    const log = { id: 'log-1', filename: 'doc.pdf' };
    logService.findById.mockResolvedValue(log);

    const result = await controller.getLogById('log-1');

    expect(logService.findById).toHaveBeenCalledWith('log-1');
    expect(result).toEqual(log);
  });

  it('throws NotFoundException when log not found by id', async () => {
    logService.findById.mockResolvedValue(null);

    await expect(controller.getLogById('non-existent')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

function mockResponse() {
  return {
    setHeader: jest.fn(),
    send: jest.fn(),
  };
}

