import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { UserRole } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockAsset = {
  id: 'media-1',
  url: 'http://r2.com/file.jpg',
  filename: 'file.jpg',
};

const mockMediaService = {
  uploadFile: jest.fn().mockResolvedValue(mockAsset),
  findAll: jest.fn().mockResolvedValue([mockAsset]),
  findOne: jest.fn().mockResolvedValue(mockAsset),
  remove: jest.fn().mockResolvedValue(mockAsset),
};

describe('MediaController', () => {
  let controller: MediaController;
  let service: typeof mockMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        { provide: MediaService, useValue: mockMediaService },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get(MediaService);
    jest.clearAllMocks();
  });

  describe('uploadFile()', () => {
    it('should call service.uploadFile', async () => {
      const mockFile = { originalname: 'test.jpg' } as any;
      const req = { user: { id: 'user-1' } };
      await controller.uploadFile(mockFile, req, 'entries', 'entry-1');
      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, 'user-1', 'entries', 'entry-1');
    });
  });

  describe('findAll()', () => {
    it('should call service.findAll with pagination', async () => {
      const filters = { page: 1, limit: 10 } as any;
      await controller.findAll(filters);
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
    });
  });

  describe('findOne()', () => {
    it('should throw NotFoundException if asset not found', async () => {
      service.findOne.mockResolvedValueOnce(null);
      await expect(controller.findOne('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
