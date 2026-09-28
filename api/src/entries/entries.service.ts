import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus, Prisma, Entry, VonalpSourceType } from '@prisma/client';
import { CreateEntryDto } from './dto/create-entry.dto';
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
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.EntryCreateInput): Promise<Entry> {
    data.entry = data.entry.trim();
    await this.ensureUniqueEntry(data.entry);

    return this.prisma.entry.create({
      data,
    });
  }

  async importRows(rows: BulkImportRow[], userId: string) {
    const created: BulkImportCreated[] = [];
    const errors: BulkImportError[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const validation = await validateBulkImportData(CreateEntryDto, row.data, row.rowNumber);
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
          ...(data as Prisma.EntryCreateInput),
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
    cursor?: Prisma.EntryWhereUniqueInput;
    where?: Prisma.EntryWhereInput;
    orderBy?: Prisma.EntryOrderByWithRelationInput;
  }): Promise<Entry[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const items = await this.prisma.entry.findMany({
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
    return attachVonalpStatuses(this.prisma, VonalpSourceType.ENTRY, items);
  }

  async findOne(where: Prisma.EntryWhereUniqueInput): Promise<Entry | null> {
    const item = await this.prisma.entry.findUnique({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatus(this.prisma, VonalpSourceType.ENTRY, item);
  }

  async update(params: {
    where: Prisma.EntryWhereUniqueInput;
    data: Prisma.EntryUpdateInput;
  }): Promise<Entry> {
    const { where, data } = params;

    if (typeof data.entry === 'string') {
      data.entry = data.entry.trim();
      await this.ensureUniqueEntry(data.entry, typeof where.id === 'string' ? where.id : undefined);
    }

    return this.prisma.entry.update({
      data,
      where,
    });
  }

  async remove(where: Prisma.EntryWhereUniqueInput): Promise<Entry> {
    return this.prisma.entry.delete({
      where,
    });
  }

  async search(query: string, params: {
    skip?: number;
    take?: number;
    where?: Prisma.EntryWhereInput;
    orderBy?: Prisma.EntryOrderByWithRelationInput;
  }) {
    const searchQuery = query.trim().split(/\s+/).map(w => `${w}:*`).join(' | ');
    const { skip, take, where: filters, orderBy } = params;
    
    const items = await this.prisma.entry.findMany({
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
              // Fallback to contains for exact partial matching on small text fields
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
    return attachVonalpStatuses(this.prisma, VonalpSourceType.ENTRY, items);
  }

  private async ensureUniqueEntry(entry: string, currentId?: string) {
    const existing = await this.prisma.entry.findFirst({
      where: {
        entry: { equals: entry, mode: 'insensitive' },
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Já existe uma entrada com este vocábulo');
    }
  }
}
