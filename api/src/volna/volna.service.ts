import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolnaTermDto } from './dto/create-volna-term.dto';
import { UpdateVolnaTermDto } from './dto/update-volna-term.dto';
import { VolnaFilterDto } from './dto/volna-filter.dto';

type AuthUser = {
  id: string;
  role: UserRole;
};

type VolnaScalarUpdate = {
  term?: string;
  language?: string;
  grammaticalCategory?: string | null;
  grammaticalSubcategory?: string | null;
  definition?: string;
  usageExample?: string | null;
  notes?: string | null;
};

const includeUsers = {
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  updatedBy: { select: { id: true, name: true, email: true, role: true } },
  approvedBy: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.VolnaTermInclude;

@Injectable()
export class VolnaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVolnaTermDto, user: AuthUser) {
    const data = this.normalize(dto);
    await this.ensureUnique(data.term, data.language);

    return this.prisma.volnaTerm.create({
      data: {
        ...data,
        createdById: user.id,
        updatedById: user.id,
        approvalStatus: ApprovalStatus.DRAFT,
      },
      include: includeUsers,
    });
  }

  async findAll(filters: VolnaFilterDto, user: AuthUser) {
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)));
    const where = this.buildWhere(filters);

    if (user.role === UserRole.OPERATOR) {
      where.createdById = user.id;
    }

    const [data, total] = await Promise.all([
      this.prisma.volnaTerm.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: includeUsers,
      }),
      this.prisma.volnaTerm.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user?: AuthUser) {
    const term = await this.prisma.volnaTerm.findUnique({
      where: { id },
      include: includeUsers,
    });

    if (!term) throw new NotFoundException('Vocábulo VOLNA não encontrado');
    if (user) this.ensureCanAccess(user, term.createdById);
    return term;
  }

  async update(id: string, dto: UpdateVolnaTermDto, user: AuthUser) {
    const current = await this.findOne(id, user);
    this.ensureCanEdit(user, current.createdById, current.approvalStatus);

    const data = this.normalizePartial(dto);
    const nextTerm = data.term ?? current.term;
    const nextLanguage = data.language ?? current.language;
    if (data.term || data.language) {
      await this.ensureUnique(nextTerm, nextLanguage, id);
    }

    return this.prisma.volnaTerm.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id,
      },
      include: includeUsers,
    });
  }

  async review(id: string, status: ApprovalStatus, reason: string | undefined, user: AuthUser) {
    const current = await this.findOne(id, user);

    if (user.role === UserRole.OPERATOR && status === ApprovalStatus.APPROVED) {
      throw new ForbiddenException('Operadores não podem aprovar vocábulos VOLNA');
    }

    const data: Prisma.VolnaTermUpdateInput = {
      approvalStatus: status,
      updatedBy: { connect: { id: user.id } },
    };

    if (status === ApprovalStatus.PENDING_APPROVAL) {
      data.submittedAt = new Date();
    } else if (status === ApprovalStatus.APPROVED) {
      data.approvedAt = new Date();
      data.approvedBy = { connect: { id: user.id } };
    } else if (status === ApprovalStatus.REJECTED) {
      data.rejectedAt = new Date();
      data.rejectionReason = reason;
    } else if (status === ApprovalStatus.NEEDS_CORRECTION) {
      data.correctionNotes = reason;
    }

    return this.prisma.volnaTerm.update({
      where: { id: current.id },
      data,
      include: includeUsers,
    });
  }

  async remove(id: string, user: AuthUser) {
    const current = await this.findOne(id, user);
    this.ensureCanEdit(user, current.createdById, current.approvalStatus);

    return this.prisma.volnaTerm.delete({
      where: { id },
      include: includeUsers,
    });
  }

  async findPublic(filters: VolnaFilterDto) {
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)));
    const where = this.buildWhere({
      ...filters,
      approvalStatus: ApprovalStatus.APPROVED,
    });

    const [data, total] = await Promise.all([
      this.prisma.volnaTerm.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ language: 'asc' }, { term: 'asc' }],
        select: {
          id: true,
          term: true,
          language: true,
          grammaticalCategory: true,
          grammaticalSubcategory: true,
          definition: true,
          usageExample: true,
          notes: true,
          approvedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.volnaTerm.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  private buildWhere(filters: VolnaFilterDto): Prisma.VolnaTermWhereInput {
    const query = filters.search?.trim();
    return {
      ...(filters.approvalStatus ? { approvalStatus: filters.approvalStatus } : {}),
      ...(filters.language ? { language: { equals: filters.language, mode: 'insensitive' } } : {}),
      ...(filters.grammaticalCategory ? { grammaticalCategory: filters.grammaticalCategory } : {}),
      ...(filters.grammaticalSubcategory ? { grammaticalSubcategory: filters.grammaticalSubcategory } : {}),
      ...(query
        ? {
            OR: [
              { term: { contains: query, mode: 'insensitive' } },
              { language: { contains: query, mode: 'insensitive' } },
              { definition: { contains: query, mode: 'insensitive' } },
              { usageExample: { contains: query, mode: 'insensitive' } },
              { notes: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private normalize(dto: CreateVolnaTermDto) {
    return {
      term: dto.term.trim(),
      language: dto.language.trim(),
      grammaticalCategory: this.optional(dto.grammaticalCategory),
      grammaticalSubcategory: this.optional(dto.grammaticalSubcategory),
      definition: dto.definition.trim(),
      usageExample: this.optional(dto.usageExample),
      notes: this.optional(dto.notes),
    };
  }

  private normalizePartial(dto: UpdateVolnaTermDto) {
    const data: VolnaScalarUpdate = {};

    if (dto.term !== undefined) data.term = dto.term.trim();
    if (dto.language !== undefined) data.language = dto.language.trim();
    if (dto.grammaticalCategory !== undefined) data.grammaticalCategory = this.optional(dto.grammaticalCategory);
    if (dto.grammaticalSubcategory !== undefined) data.grammaticalSubcategory = this.optional(dto.grammaticalSubcategory);
    if (dto.definition !== undefined) data.definition = dto.definition.trim();
    if (dto.usageExample !== undefined) data.usageExample = this.optional(dto.usageExample);
    if (dto.notes !== undefined) data.notes = this.optional(dto.notes);

    return data;
  }

  private optional(value?: string) {
    return value?.trim() || null;
  }

  private async ensureUnique(term: string, language: string, currentId?: string) {
    const existing = await this.prisma.volnaTerm.findFirst({
      where: {
        term: { equals: term, mode: 'insensitive' },
        language: { equals: language, mode: 'insensitive' },
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Já existe este vocábulo VOLNA para a língua indicada');
    }
  }

  private ensureCanAccess(user: AuthUser, createdById: string | null) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR) return;
    if (createdById !== user.id) throw new ForbiddenException('Sem permissão para aceder a este vocábulo VOLNA');
  }

  private ensureCanEdit(user: AuthUser, createdById: string | null, status: ApprovalStatus) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR) return;
    if (createdById !== user.id) throw new ForbiddenException('Sem permissão para gerir este vocábulo VOLNA');
    if (status !== ApprovalStatus.DRAFT && status !== ApprovalStatus.NEEDS_CORRECTION) {
      throw new ForbiddenException('Só pode editar ou eliminar rascunhos ou vocábulos com correcção solicitada');
    }
  }
}
