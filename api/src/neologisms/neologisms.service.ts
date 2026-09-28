import { ConflictException, Injectable } from '@nestjs/common';
import { ApprovalStatus, Neologism, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNeologismDto } from './dto/create-neologism.dto';
import {
  buildBulkImportResult,
  BulkImportCreated,
  BulkImportError,
  BulkImportRow,
  httpErrorToImportMessage,
  importKey,
  validateBulkImportData,
} from '../common/bulk-import';

@Injectable()
export class NeologismsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.NeologismCreateInput): Promise<Neologism> {
    data.entry = data.entry.trim();
    await this.ensureUniqueNeologism(data.entry);

    return this.prisma.neologism.create({ data });
  }

  async importRows(rows: BulkImportRow[], userId: string) {
    const created: BulkImportCreated[] = [];
    const errors: BulkImportError[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const validation = await validateBulkImportData(CreateNeologismDto, row.data, row.rowNumber);
      if (validation.errors.length > 0) {
        errors.push(...validation.errors);
        continue;
      }

      const data = validation.data;
      const key = importKey(data.entry);

      if (seen.has(key)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'entry',
          value: data.entry,
          message: 'Vocábulo duplicado no ficheiro',
        });
        continue;
      }
      seen.add(key);

      try {
        const item = await this.create({
          ...(data as Prisma.NeologismCreateInput),
          createdBy: { connect: { id: userId } },
          approvalStatus: ApprovalStatus.DRAFT,
        });
        created.push({ rowNumber: row.rowNumber, id: item.id, label: item.entry });
      } catch (error) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'entry',
          value: data.entry,
          message: httpErrorToImportMessage(error),
        });
      }
    }

    return buildBulkImportResult(rows.length, created, errors);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.NeologismWhereUniqueInput;
    where?: Prisma.NeologismWhereInput;
    orderBy?: Prisma.NeologismOrderByWithRelationInput;
  }): Promise<Neologism[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.neologism.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(where: Prisma.NeologismWhereUniqueInput): Promise<Neologism | null> {
    return this.prisma.neologism.findUnique({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
  }

  async update(params: {
    where: Prisma.NeologismWhereUniqueInput;
    data: Prisma.NeologismUpdateInput;
  }): Promise<Neologism> {
    const { where, data } = params;

    if (typeof data.entry === 'string') {
      data.entry = data.entry.trim();
      await this.ensureUniqueNeologism(data.entry, typeof where.id === 'string' ? where.id : undefined);
    }

    return this.prisma.neologism.update({ where, data });
  }

  async remove(where: Prisma.NeologismWhereUniqueInput): Promise<Neologism> {
    return this.prisma.neologism.delete({ where });
  }

  async search(query: string, params: {
    skip?: number;
    take?: number;
    where?: Prisma.NeologismWhereInput;
    orderBy?: Prisma.NeologismOrderByWithRelationInput;
  }) {
    const searchQuery = query.trim().split(/\s+/).map((word) => `${word}:*`).join(' | ');
    const { skip, take, where: filters, orderBy } = params;

    return this.prisma.neologism.findMany({
      skip,
      take,
      orderBy,
      where: {
        AND: [
          filters || {},
          {
            OR: [
              { entry: { search: searchQuery } },
              { firstDefinition: { search: searchQuery } },
              { etymology: { search: searchQuery } },
              { usageExample: { search: searchQuery } },
              { entry: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
  }

  private async ensureUniqueNeologism(entry: string, currentId?: string) {
    const existing = await this.prisma.neologism.findFirst({
      where: {
        entry: { equals: entry, mode: 'insensitive' },
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Já existe um neologismo com este vocábulo');
    }
  }
}
