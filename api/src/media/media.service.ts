import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { AppLogger } from '../common/logger/app-logger.service';
import { Prisma } from '@prisma/client';

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
      endpoint: this.configService.getOrThrow<string>('storage.r2Endpoint'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('storage.r2AccessKeyId'),
        secretAccessKey: this.configService.getOrThrow<string>('storage.r2SecretAccessKey'),
      },
    });
    this.bucketName = this.configService.getOrThrow<string>('storage.r2BucketName');
    this.publicUrl = this.configService.getOrThrow<string>('storage.r2PublicUrl');
  }

  async uploadFile(file: Express.Multer.File, userId?: string, entity?: string, entityId?: string) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    const maxFileMb = this.configService.getOrThrow<number>('app.mediaMaxFileMb');
    if (file.size > maxFileMb * 1024 * 1024) {
      throw new BadRequestException(`O ficheiro excede o limite de ${maxFileMb}MB`);
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp3', '.wav', '.ogg', '.m4a']);
    if (!allowedExtensions.has(fileExtension)) {
      throw new BadRequestException('Extensão de ficheiro não permitida');
    }

    const allowedMimeTypes = new Set([
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
    ]);
    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('Tipo de ficheiro não permitido');
    }

    const isImage = file.mimetype.startsWith('image/');
    const signature = file.buffer.subarray(0, 12);
    const validSignature = isImage
      ? this.hasImageSignature(fileExtension, signature)
      : this.hasAudioSignature(fileExtension, signature);
    if (!validSignature) {
      throw new BadRequestException('O conteúdo do ficheiro não corresponde ao tipo declarado');
    }

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

  private hasImageSignature(extension: string, bytes: Buffer): boolean {
    if (extension === '.jpg' || extension === '.jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (extension === '.png') return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    if (extension === '.gif') return bytes.subarray(0, 6).toString('ascii') === 'GIF87a' || bytes.subarray(0, 6).toString('ascii') === 'GIF89a';
    if (extension === '.webp') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
    return false;
  }

  private hasAudioSignature(extension: string, bytes: Buffer): boolean {
    if (extension === '.wav') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WAVE';
    if (extension === '.ogg') return bytes.subarray(0, 4).toString('ascii') === 'OggS';
    if (extension === '.mp3') return bytes.subarray(0, 3).toString('ascii') === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
    if (extension === '.m4a') return bytes.subarray(4, 8).toString('ascii') === 'ftyp';
    return false;
  }

  async findAll(params: Prisma.MediaAssetFindManyArgs) {
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
