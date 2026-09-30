import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseFilePipe,
  PayloadTooLargeException,
  Post,
  Query,
  Req,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ManualVocabularyService } from './manual-vocabulary.service';
import { ManualVocabularyLogService } from './manual-vocabulary-log.service';

@ApiTags('manual-vocabulary')
@ApiBearerAuth()
@Controller('manuals/vocabulary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManualVocabularyController {
  constructor(
    private readonly manualVocabularyService: ManualVocabularyService,
    private readonly manualVocabularyLogService: ManualVocabularyLogService,
    private readonly configService: ConfigService,
  ) {}

  @Post('extract')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        callback(null, file.mimetype === 'application/pdf');
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOperation({
    summary: 'Extrair vocabulário de um manual PDF e gerar Excel revisável',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        modules: {
          type: 'string',
          description: 'Módulos separados por vírgula',
        },
        startPage: { type: 'number', description: 'Página inicial a extrair' },
        endPage: { type: 'number', description: 'Página final a extrair' },
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
    @Req() _req: Request,
    @Body()
    body: {
      modules?: string | string[];
      startPage?: string | number;
      endPage?: string | number;
    },
    @Res() res: Response,
    @CurrentUser() user?: { id?: string },
  ) {
    this.validatePdf(file);
    this.validateSize(file);

    const rawModules = body?.modules;
    let selectedModules:
      | import('./manual-vocabulary.types').ManualVocabularySourceModel[]
      | undefined;
    if (typeof rawModules === 'string' && rawModules.trim()) {
      selectedModules = rawModules
        .split(',')
        .map(
          (m) =>
            m
              .trim()
              .toUpperCase() as import('./manual-vocabulary.types').ManualVocabularySourceModel,
        )
        .filter(Boolean);
    } else if (Array.isArray(rawModules)) {
      selectedModules = rawModules
        .map(
          (m) =>
            String(m)
              .trim()
              .toUpperCase() as import('./manual-vocabulary.types').ManualVocabularySourceModel,
        )
        .filter(Boolean);
    }

    const startPage = body?.startPage ? Number(body.startPage) : undefined;
    const endPage = body?.endPage ? Number(body.endPage) : undefined;
    const pageOptions =
      startPage || endPage ? { startPage, endPage } : undefined;

    const result = pageOptions
      ? await this.manualVocabularyService.extract(
          file,
          user?.id,
          selectedModules,
          pageOptions,
        )
      : await this.manualVocabularyService.extract(
          file,
          user?.id,
          selectedModules,
        );

    const wantsJson =
      (body as any)?.format === 'json' ||
      _req?.query?.format === 'json' ||
      _req?.headers?.['accept']?.includes('application/json');

    if (wantsJson) {
      return res.json({
        success: true,
        filename: result.filename,
        stats: result.stats,
        workbookData: result.workbookData,
        processingMs: result.processingMs,
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.setHeader('X-Total-Terms', String(result.stats.totalTerms));
    res.setHeader('X-Valid-Rows', String(result.stats.validRows));
    res.setHeader('X-Entries', String(result.stats.entries));
    res.setHeader('X-Neologisms', String(result.stats.neologisms));
    res.setHeader('X-Toponyms', String(result.stats.toponyms));
    res.setHeader('X-Anthroponyms', String(result.stats.anthroponyms));
    res.setHeader('X-Foreignisms', String(result.stats.foreignisms));
    res.setHeader('X-Warnings', String(result.stats.warnings));
    res.setHeader(
      'X-Duplicates-Removed',
      String(result.stats.duplicatesRemoved),
    );
    res.send(result.buffer);
  }

  @Post('import-excel')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        const isXlsx =
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.originalname.toLowerCase().endsWith('.xlsx');
        callback(null, isXlsx);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Importar ficheiro Excel (.xlsx) para curadoria e validação no ecrã de revisão',
  })
  async importExcel(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ) {
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException(
        'Apenas ficheiros Excel (.xlsx) são suportados',
      );
    }
    const workbookData = await this.manualVocabularyService.parseExcel(
      file.buffer,
    );
    return {
      success: true,
      filename: file.originalname,
      stats: workbookData.stats,
      workbookData,
    };
  }

  @Post('export-excel')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOperation({
    summary:
      'Gerar e descarregar ficheiro Excel (.xlsx) a partir dos dados curados no frontend',
  })
  async exportExcel(
    @Body()
    body: {
      workbookData: import('./manual-vocabulary.types').ManualVocabularyWorkbookData;
    },
    @Res() res: Response,
  ) {
    if (!body?.workbookData) {
      throw new BadRequestException(
        'Os dados da folha de cálculo são obrigatórios',
      );
    }
    const buffer = await this.manualVocabularyService.exportExcel(
      body.workbookData,
    );
    const filename = `vocabulario_curado_${Date.now()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Post('commit-to-database')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({
    summary:
      'Salvar itens curados na base de dados com validação forte de duplicatas',
  })
  async commitToDatabase(
    @Body()
    body: import('./manual-vocabulary.types').ManualVocabularyCommitPayload,
    @CurrentUser() user?: { id?: string },
  ) {
    return this.manualVocabularyService.commitToDatabase(body, user?.id);
  }

  @Get('logs')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Consultar histórico de auditoria de extracções de manuais',
  })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getLogs(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('userId') userId?: string,
  ) {
    return this.manualVocabularyLogService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      userId,
    });
  }

  @Get('logs/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Consultar detalhe de um registo de auditoria de extracção',
  })
  async getLogById(@Param('id') id: string) {
    const log = await this.manualVocabularyLogService.findById(id);
    if (!log) {
      throw new NotFoundException(
        `Registo de auditoria com ID "${id}" não encontrado`,
      );
    }
    return log;
  }

  private validatePdf(file: Express.Multer.File) {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas ficheiros PDF são permitidos');
    }

    const signature = file.buffer.subarray(0, 5).toString('ascii');
    if (signature !== '%PDF-') {
      throw new BadRequestException(
        'O conteúdo do ficheiro não corresponde a um PDF válido',
      );
    }

    const eof = file.buffer.lastIndexOf(Buffer.from('%%EOF'));
    if (eof === -1) {
      throw new BadRequestException('PDF inválido ou incompleto');
    }
  }

  private validateSize(file: Express.Multer.File) {
    const maxMb = Number(
      this.configService.get<number>('ai.vocabularyMaxFileMb') ?? 100,
    );
    const maxBytes = maxMb * 1024 * 1024;

    if (file.size > maxBytes) {
      throw new PayloadTooLargeException(
        `O ficheiro excede o limite de ${maxMb}MB`,
      );
    }
  }
}
