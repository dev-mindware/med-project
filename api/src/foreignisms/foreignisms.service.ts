import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus, Prisma, Foreignism, VonalpSourceType } from '@prisma/client';
import { CreateForeignismDto } from './dto/create-foreignism.dto';
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
export class ForeignismsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ForeignismCreateInput): Promise<Foreignism> {
    data.term = data.term.trim();
    await this.ensureUniqueForeignism(data.term);

    return this.prisma.foreignism.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ForeignismWhereInput;
    orderBy?: Prisma.ForeignismOrderByWithRelationInput;
  }): Promise<Foreignism[]> {
    const items = await this.prisma.foreignism.findMany({
      ...params,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatuses(this.prisma, VonalpSourceType.FOREIGNISM, items);
  }

  async importRows(rows: BulkImportRow[], userId: string) {
    const created: BulkImportCreated[] = [];
    const errors: BulkImportError[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const validation = await validateBulkImportData(CreateForeignismDto, row.data, row.rowNumber);
      if (validation.errors.length > 0) {
        errors.push(...validation.errors);
        continue;
      }

      const data = validation.data as CreateForeignismDto;
      const key = importKey(data.term);

      if (seen.has(key)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'term',
          value: data.term,
          message: 'Vocábulo duplicado no ficheiro',
        });
        continue;
      }
      seen.add(key);

      try {
        const item = await this.create({
          ...(data as Prisma.ForeignismCreateInput),
          createdBy: { connect: { id: userId } },
          approvalStatus: ApprovalStatus.DRAFT,
        });
        created.push({ rowNumber: row.rowNumber, id: item.id, label: item.term });
      } catch (error) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'term',
          value: data.term,
          message: httpErrorToImportMessage(error),
        });
      }
    }

    return buildBulkImportResult(rows.length, created, errors);
  }

  async findOne(where: Prisma.ForeignismWhereUniqueInput): Promise<Foreignism | null> {
    const item = await this.prisma.foreignism.findUnique({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatus(this.prisma, VonalpSourceType.FOREIGNISM, item);
  }

  async update(params: {
    where: Prisma.ForeignismWhereUniqueInput;
    data: Prisma.ForeignismUpdateInput;
  }): Promise<Foreignism> {
    const { where, data } = params;

    if (typeof data.term === 'string') {
      data.term = data.term.trim();
      await this.ensureUniqueForeignism(data.term, typeof where.id === 'string' ? where.id : undefined);
    }

    return this.prisma.foreignism.update(params);
  }

  async remove(where: Prisma.ForeignismWhereUniqueInput): Promise<Foreignism> {
    return this.prisma.foreignism.delete({ where });
  }

  async search(query: string, params: {
    skip?: number;
    take?: number;
    where?: Prisma.ForeignismWhereInput;
    orderBy?: Prisma.ForeignismOrderByWithRelationInput;
  }): Promise<Foreignism[]> {
    const searchQuery = query.trim().split(/\s+/).map(w => `${w}:*`).join(' | ');
    const { skip, take, where: filters, orderBy } = params;
    
    const items = await this.prisma.foreignism.findMany({
      skip,
      take,
      orderBy,
      where: {
        AND: [
          filters || {},
          {
            OR: [
              { term: { search: searchQuery } },
              { meaning: { search: searchQuery } },
              { definition: { search: searchQuery } },
              { context: { search: searchQuery } },
              { term: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
    return attachVonalpStatuses(this.prisma, VonalpSourceType.FOREIGNISM, items);
  }

  private async ensureUniqueForeignism(term: string, currentId?: string) {
    const existing = await this.prisma.foreignism.findFirst({
      where: {
        term: { equals: term, mode: 'insensitive' },
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Já existe um estrangeirismo com este vocábulo');
    }
  }
}
