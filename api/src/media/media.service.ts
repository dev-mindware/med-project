import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { AppLogger } from '../common/logger/app-logger.service';

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private logger: AppLogger,
  ) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY') ?? '',
      },
    });
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') ?? '';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') ?? '';
  }

  async uploadFile(file: Express.Multer.File, userId?: string, entity?: string, entityId?: string) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    const isAllowedMedia = file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/');
    if (!isAllowedMedia) {
      throw new BadRequestException('Apenas imagens e áudios são permitidos');
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = entity ? `${entity}/${fileName}` : fileName;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const url = `${this.publicUrl}/${key}`;

      // Save to database
      const mediaAsset = await this.prisma.mediaAsset.create({
        data: {
          url,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          storageProvider: 'cloudflare_r2',
          uploadedById: userId,
          entity,
          entityId,
        },
      });

      return mediaAsset;
    } catch (error) {
      this.logger.error('Failed to upload media file', {
        context: 'MediaService',
        action: 'MEDIA_UPLOAD_FAILED',
        userId,
        error,
        meta: {
          entity,
          entityId,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          storageProvider: 'cloudflare_r2',
        },
      });
      throw new InternalServerErrorException('Failed to upload file to R2');
    }
  }

  async findAll(params: { skip?: number; take?: number; where?: any; orderBy?: any }) {
    return this.prisma.mediaAsset.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.mediaAsset.findUnique({ where: { id } });
  }

  async remove(id: string) {
    // Note: We might want to delete from R2 as well, but for now let's just delete the record
    return this.prisma.mediaAsset.delete({ where: { id } });
  }
}
