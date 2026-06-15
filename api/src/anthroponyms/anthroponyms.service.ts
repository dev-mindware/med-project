import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus, Prisma, Anthroponym, VonalpSourceType } from '@prisma/client';
import { CreateAnthroponymDto } from './dto/create-anthroponym.dto';
import {
  buildBulkImportResult,
  BulkImportCreated,
  BulkImportError,
  BulkImportRow,
  httpErrorToImportMessage,
  importKey,
  validateBulkImportData,
} from '../common/bulk-import';
import { attachVonalpStatus, attachVonalpStatuses } from '../common/vonalp-status';

@Injectable()
export class AnthroponymsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AnthroponymCreateInput): Promise<Anthroponym> {
    data.name = data.name.trim();
    await this.ensureUniqueAnthroponym(data.name);

    return this.prisma.anthroponym.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AnthroponymWhereInput;
    orderBy?: Prisma.AnthroponymOrderByWithRelationInput;
  }): Promise<Anthroponym[]> {
    const items = await this.prisma.anthroponym.findMany({
      ...params,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatuses(this.prisma, VonalpSourceType.ANTHROPONYM, items);
  }

  async importRows(rows: BulkImportRow[], userId: string) {
    const created: BulkImportCreated[] = [];
    const errors: BulkImportError[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const validation = await validateBulkImportData(CreateAnthroponymDto, row.data, row.rowNumber);
      if (validation.errors.length > 0) {
        errors.push(...validation.errors);
        continue;
      }

      const data = validation.data as CreateAnthroponymDto;
      const key = importKey(data.name);

      if (seen.has(key)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'name',
          value: data.name,
          message: 'Vocábulo duplicado no ficheiro',
        });
        continue;
      }
      seen.add(key);

      try {
        const item = await this.create({
          ...(data as Prisma.AnthroponymCreateInput),
          createdBy: { connect: { id: userId } },
          approvalStatus: ApprovalStatus.DRAFT,
        });
        created.push({ rowNumber: row.rowNumber, id: item.id, label: item.name });
      } catch (error) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'name',
          value: data.name,
          message: httpErrorToImportMessage(error),
        });
      }
    }

    return buildBulkImportResult(rows.length, created, errors);
  }

  async findOne(where: Prisma.AnthroponymWhereUniqueInput): Promise<Anthroponym | null> {
    const item = await this.prisma.anthroponym.findUnique({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatus(this.prisma, VonalpSourceType.ANTHROPONYM, item);
  }

  async update(params: {
    where: Prisma.AnthroponymWhereUniqueInput;
    data: Prisma.AnthroponymUpdateInput;
  }): Promise<Anthroponym> {
    const { where, data } = params;

    if (typeof data.name === 'string') {
      data.name = data.name.trim();
      await this.ensureUniqueAnthroponym(data.name, typeof where.id === 'string' ? where.id : undefined);
    }

    return this.prisma.anthroponym.update(params);
  }

  async remove(where: Prisma.AnthroponymWhereUniqueInput): Promise<Anthroponym> {
    return this.prisma.anthroponym.delete({ where });
  }

  async search(query: string, params: {
    skip?: number;
    take?: number;
    where?: Prisma.AnthroponymWhereInput;
    orderBy?: Prisma.AnthroponymOrderByWithRelationInput;
  }): Promise<Anthroponym[]> {
    const searchQuery = query.trim().split(/\s+/).map(w => `${w}:*`).join(' | ');
    const { skip, take, where: filters, orderBy } = params;
    const items = await this.prisma.anthroponym.findMany({
      skip,
      take,
      orderBy,
      where: {
        AND: [
          filters || {},
          {
            OR: [
              { name: { search: searchQuery } },
              { meaning: { search: searchQuery } },
              { etymology: { search: searchQuery } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatuses(this.prisma, VonalpSourceType.ANTHROPONYM, items);
  }

  private async ensureUniqueAnthroponym(name: string, currentId?: string) {
    const existing = await this.prisma.anthroponym.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Já existe um antropónimo com este vocábulo');
    }
  }
}
