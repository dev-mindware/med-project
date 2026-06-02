import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { AppLogger } from '../common/logger/app-logger.service';

// Mock S3Client
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockResolvedValue({}),
      };
    }),
    PutObjectCommand: jest.fn(),
  };
});

const mockMediaAsset = {
  id: 'media-1',
  url: 'http://r2.com/file.jpg',
  filename: 'file.jpg',
  mimeType: 'image/jpeg',
  size: 1024,
  createdAt: new Date(),
};

const mockPrismaService = {
  mediaAsset: {
    create: jest.fn().mockResolvedValue(mockMediaAsset),
    findMany: jest.fn().mockResolvedValue([mockMediaAsset]),
    findUnique: jest.fn().mockResolvedValue(mockMediaAsset),
    delete: jest.fn().mockResolvedValue(mockMediaAsset),
  },
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      R2_ENDPOINT: 'http://r2.endpoint',
      R2_ACCESS_KEY_ID: 'access-key',
      R2_SECRET_ACCESS_KEY: 'secret-key',
      R2_BUCKET_NAME: 'test-bucket',
      R2_PUBLIC_URL: 'http://public.url',
    };
    return config[key];
  }),
};

describe('MediaService', () => {
  let service: MediaService;
  let prisma: typeof mockPrismaService;
  const mockLogger = {
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('uploadFile()', () => {
    it('should upload a file and save record to db', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 500,
        buffer: Buffer.from('test'),
      } as any;

      const result = await service.uploadFile(mockFile, 'user-1', 'entries', 'entry-1');
      
      expect(result).toEqual(mockMediaAsset);
      expect(prisma.mediaAsset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            filename: 'test.jpg',
            entity: 'entries',
            entityId: 'entry-1',
          }),
        }),
      );
    });
  });

  describe('findAll()', () => {
    it('should return media assets', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockMediaAsset]);
    });
  });

  describe('findOne()', () => {
    it('should return a media asset by id', async () => {
      const result = await service.findOne('media-1');
      expect(result).toEqual(mockMediaAsset);
    });
  });

  describe('remove()', () => {
    it('should delete a media asset from db', async () => {
      const result = await service.remove('media-1');
      expect(result).toEqual(mockMediaAsset);
      expect(prisma.mediaAsset.delete).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
    });
  });
});
