import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApprovalStatus,
  Prisma,
  Toponym,
  VonalpSourceType,
} from '@prisma/client';
import { CreateToponymDto } from './dto/create-toponym.dto';
import {
  buildBulkImportResult,
  BulkImportCreated,
  BulkImportError,
  BulkImportRow,
  httpErrorToImportMessage,
  importKey,
  validateBulkImportData,
} from '../common/bulk-import';
import {
  attachVonalpStatus,
  attachVonalpStatuses,
} from '../common/vonalp-status';

@Injectable()
export class ToponymsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ToponymCreateInput): Promise<Toponym> {
    data.toponym = data.toponym.trim();
    await this.ensureUniqueToponym(data.toponym);

    return this.prisma.toponym.create({
      data,
    });
  }

  async importRows(rows: BulkImportRow[], userId: string) {
    const created: BulkImportCreated[] = [];
    const errors: BulkImportError[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const validation = await validateBulkImportData(
        CreateToponymDto,
        row.data,
        row.rowNumber,
      );
      if (validation.errors.length > 0) {
        errors.push(...validation.errors);
        continue;
      }

      const data = validation.data;
      const key = importKey(data.toponym);

      if (seen.has(key)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'toponym',
          value: data.toponym,
          message: 'Vocábulo duplicado no ficheiro',
        });
        continue;
      }
      seen.add(key);

      try {
        const item = await this.create({
          ...(data as Prisma.ToponymCreateInput),
          createdBy: { connect: { id: userId } },
          approvalStatus: ApprovalStatus.DRAFT,
        });
        created.push({
          rowNumber: row.rowNumber,
          id: item.id,
          label: item.toponym,
        });
      } catch (error) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'toponym',
          value: data.toponym,
          message: httpErrorToImportMessage(error),
        });
      }
    }

    return buildBulkImportResult(rows.length, created, errors);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ToponymWhereInput;
    orderBy?: Prisma.ToponymOrderByWithRelationInput;
  }): Promise<Toponym[]> {
    const items = await this.prisma.toponym.findMany({
      ...params,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatuses(this.prisma, VonalpSourceType.TOPONYM, items);
  }

  async findOne(
    where: Prisma.ToponymWhereUniqueInput,
  ): Promise<Toponym | null> {
    const item = await this.prisma.toponym.findUnique({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatus(this.prisma, VonalpSourceType.TOPONYM, item);
  }

  async update(params: {
    where: Prisma.ToponymWhereUniqueInput;
    data: Prisma.ToponymUpdateInput;
  }): Promise<Toponym> {
    const { where, data } = params;

    if (typeof data.toponym === 'string') {
      data.toponym = data.toponym.trim();
      await this.ensureUniqueToponym(
        data.toponym,
        typeof where.id === 'string' ? where.id : undefined,
      );
    }

    return this.prisma.toponym.update(params);
  }

  async remove(where: Prisma.ToponymWhereUniqueInput): Promise<Toponym> {
    return this.prisma.toponym.delete({
      where,
    });
  }

  async search(
    query: string,
    params: {
      skip?: number;
      take?: number;
      where?: Prisma.ToponymWhereInput;
      orderBy?: Prisma.ToponymOrderByWithRelationInput;
    },
  ) {
    const searchQuery = query
      .trim()
      .split(/\s+/)
      .map((w) => `${w}:*`)
      .join(' | ');
    const { skip, take, where: filters, orderBy } = params;

    const items = await this.prisma.toponym.findMany({
      skip,
      take,
      orderBy,
      where: {
        AND: [
          filters || {},
          {
            OR: [
              { toponym: { search: searchQuery } },
              { meaning: { search: searchQuery } },
              { toponymHistory: { search: searchQuery } },
              { toponymProvenance: { search: searchQuery } },
              { toponym: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatuses(this.prisma, VonalpSourceType.TOPONYM, items);
  }

  private async ensureUniqueToponym(toponym: string, currentId?: string) {
    const existing = await this.prisma.toponym.findFirst({
      where: {
        toponym: { equals: toponym, mode: 'insensitive' },
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Já existe um topónimo com este vocábulo');
    }
  }
}
