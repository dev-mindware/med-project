import {
  BadRequestException,
  Body,
  Controller,
  ParseFilePipe,
  PayloadTooLargeException,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ManualVocabularyService } from './manual-vocabulary.service';

@ApiTags('manual-vocabulary')
@ApiBearerAuth()
@Controller('manuals/vocabulary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManualVocabularyController {
  constructor(
    private readonly manualVocabularyService: ManualVocabularyService,
    private readonly configService: ConfigService,
  ) {}

  @Post('extract')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiOperation({ summary: 'Extrair vocabulário de um manual PDF e gerar Excel revisável' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async extract(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Request() _req: Request,
    @Body() _body: Record<string, unknown>,
    @Res() res: Response,
  ) {
    this.validatePdf(file);
    this.validateSize(file);

    const result = await this.manualVocabularyService.extract(file);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('X-Total-Terms', String(result.stats.totalTerms));
    res.setHeader('X-Valid-Rows', String(result.stats.validRows));
    res.setHeader('X-Warnings', String(result.stats.warnings));
    res.setHeader('X-Duplicates-Removed', String(result.stats.duplicatesRemoved));
    res.send(result.buffer);
  }

  private validatePdf(file: Express.Multer.File) {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas ficheiros PDF sao permitidos');
    }
  }

  private validateSize(file: Express.Multer.File) {
    const maxMb = Number(this.configService.get<number>('ai.vocabularyMaxFileMb') ?? 20);
    const maxBytes = maxMb * 1024 * 1024;

    if (file.size > maxBytes) {
      throw new PayloadTooLargeException(`O ficheiro excede o limite de ${maxMb}MB`);
    }
  }
}
