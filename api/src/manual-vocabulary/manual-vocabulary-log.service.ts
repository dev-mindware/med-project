import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/app-logger.service';
import { ManualVocabularyStats } from './manual-vocabulary.types';
import { ManualExtractionLog } from '@prisma/client';

export interface LogExtractionParams {
  filename: string;
  fileSize: number;
  userId?: string;
  model: string;
  stats: ManualVocabularyStats;
  processingMs: number;
}

export interface FindLogsQuery {
  skip?: number;
  take?: number;
  userId?: string;
}

/**
 * Serviço responsável pelo registo de auditoria de extracções de manuais.
 * Guarda estatísticas, modelo de IA utilizado, métricas de tempo e resultados.
 *
 * Norma ortográfica: Acordo Ortográfico de 1945 (AO45).
 */
@Injectable()
export class ManualVocabularyLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Grava o registo de auditoria da extracção.
   * Em caso de falha na persistência, regista o aviso sem interromper o fluxo do utilizador.
   */
  async logExtraction(
    params: LogExtractionParams,
  ): Promise<ManualExtractionLog | null> {
    try {
      const log = await this.prisma.manualExtractionLog.create({
        data: {
          filename: params.filename,
          fileSize: params.fileSize,
          userId: params.userId ?? null,
          model: params.model,
          totalTerms: params.stats.totalTerms,
          validRows: params.stats.validRows,
          entries: params.stats.entries,
          neologisms: params.stats.neologisms,
          toponyms: params.stats.toponyms,
          anthroponyms: params.stats.anthroponyms,
          foreignisms: params.stats.foreignisms,
          warnings: params.stats.warnings,
          duplicatesRemoved: params.stats.duplicatesRemoved,
          lowConfidenceDiscarded: params.stats.lowConfidenceDiscarded,
          processingMs: params.processingMs,
        },
      });

      this.logger.info('Registo de auditoria de extracção gravado com sucesso', {
        context: 'ManualVocabularyLogService',
        action: 'LOG_EXTRACTION_SUCCESS',
        meta: {
          logId: log.id,
          filename: params.filename,
          totalTerms: params.stats.totalTerms,
          processingMs: params.processingMs,
        },
      });

      return log;
    } catch (error) {
      this.logger.error('Falha ao gravar registo de auditoria de extracção', {
        context: 'ManualVocabularyLogService',
        action: 'LOG_EXTRACTION_ERROR',
        error: error instanceof Error ? error.stack : error,
        meta: { filename: params.filename, error: String(error) },
      });
      return null;
    }
  }

  /**
   * Consulta o histórico de registos de auditoria de extracção.
   */
  async findAll(query: FindLogsQuery = {}): Promise<{
    items: ManualExtractionLog[];
    total: number;
  }> {
    const { skip = 0, take = 20, userId } = query;
    const where = userId ? { userId } : {};

    const [items, total] = await Promise.all([
      this.prisma.manualExtractionLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      this.prisma.manualExtractionLog.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Obtém os detalhes de um registo de auditoria específico pelo ID.
   */
  async findById(id: string): Promise<ManualExtractionLog | null> {
    return this.prisma.manualExtractionLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }
}
