import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalStatus,
  Prisma,
  UserRole,
  VonalpCompletionStatus,
  VonalpSourceType,
  VonalpTerm,
  VonalpVocabularyType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MarkVonalpDto } from './dto/mark-vonalp.dto';
import { UpdateVonalpTermDto } from './dto/update-vonalp-term.dto';
import { VonalpFilterDto } from './dto/vonalp-filter.dto';

type AuthUser = {
  id: string;
  role: UserRole;
};

type SourceConfig = {
  delegateName: 'entry' | 'toponym' | 'anthroponym' | 'foreignism';
  origin: string;
  vocabularyFlag: 'isVocabulary' | 'isVocabularyEP';
};

type SourceRecord = {
  id: string;
  createdById?: string | null;
  approvalStatus?: ApprovalStatus;
  createdBy?: { id: string; supervisorId?: string | null } | null;
  entry?: string | null;
  firstDefinition?: string | null;
  secondDefinition?: string | null;
  pronunciation?: string | null;
  grammaticalCategory?: string | null;
  grammaticalSubcategory?: string | null;
  syllabicDivision?: string | null;
  etymology?: string | null;
  definition?: string | null;
  meaning?: string | null;
  toponym?: string | null;
  toponymProvenance?: string | null;
  toponymHistory?: string | null;
  name?: string | null;
  gender?: string | null;
  term?: string | null;
  originalLanguage?: string | null;
  originCountry?: string | null;
  origin?: string | null;
};

type VonalpFields = Pick<
  VonalpTerm,
  | 'term'
  | 'pronunciation'
  | 'grammaticalCategory'
  | 'grammaticalSubcategory'
  | 'syllabicDivision'
  | 'etymology'
  | 'firstDefinition'
  | 'secondDefinition'
  | 'origin'
>;

const REQUIRED_FIELDS: Array<keyof VonalpFields> = [
  'term',
  'pronunciation',
  'grammaticalCategory',
  'grammaticalSubcategory',
  'syllabicDivision',
  'etymology',
  'firstDefinition',
  'origin',
];

const SOURCE_CONFIG: Record<
  VonalpSourceType,
  Omit<SourceConfig, 'vocabularyFlag'>
> = {
  ENTRY: { delegateName: 'entry', origin: 'Dicionário' },
  TOPONYM: { delegateName: 'toponym', origin: 'Topónimo' },
  ANTHROPONYM: { delegateName: 'anthroponym', origin: 'Antropónimo' },
  FOREIGNISM: { delegateName: 'foreignism', origin: 'Estrangeirismo' },
};

@Injectable()
export class VonalpService {
  constructor(private prisma: PrismaService) {}

  async mark(dto: MarkVonalpDto, user: AuthUser) {
    const source = await this.getSource(dto.sourceType, dto.sourceId);
    this.ensureCanManageSource(user, source);

    const existing = await this.prisma.vonalpTerm.findUnique({
      where: {
        vocabularyType_sourceType_sourceId: {
          vocabularyType: dto.vocabularyType,
          sourceType: dto.sourceType,
          sourceId: dto.sourceId,
        },
      },
    });

    if (
      existing &&
      existing.completionStatus !== VonalpCompletionStatus.ARCHIVED
    ) {
      const missingFields = this.getMissingFields(existing);
      const completionStatus =
        missingFields.length === 0
          ? VonalpCompletionStatus.COMPLETE
          : VonalpCompletionStatus.INCOMPLETE;
      const term =
        completionStatus !== existing.completionStatus ||
        missingFields.join('|') !== existing.missingFields.join('|')
          ? await this.prisma.vonalpTerm.update({
              where: { id: existing.id },
              data: {
                missingFields,
                completionStatus,
                completedAt:
                  completionStatus === VonalpCompletionStatus.COMPLETE
                    ? new Date()
                    : existing.completedAt,
              },
            })
          : existing;

      if (term.completionStatus === VonalpCompletionStatus.COMPLETE) {
        await this.setSourceVocabularyFlag(
          dto.sourceType,
          dto.sourceId,
          dto.vocabularyType,
          true,
        );
      }
      return this.withWorkflowMetadata(term, user);
    }

    const copiedFields = this.mapSourceToVonalpFields(dto.sourceType, source);
    const missingFields = this.getMissingFields(copiedFields);
    const completionStatus =
      missingFields.length === 0
        ? VonalpCompletionStatus.COMPLETE
        : VonalpCompletionStatus.INCOMPLETE;

    const payload = {
      ...copiedFields,
      vocabularyType: dto.vocabularyType,
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
      sourceCreatedById: source.createdById,
      missingFields,
      completionStatus,
      completedAt:
        completionStatus === VonalpCompletionStatus.COMPLETE
          ? new Date()
          : null,
      createdById: existing?.createdById || user.id,
      updatedById: user.id,
    };

    const term = existing
      ? await this.prisma.vonalpTerm.update({
          where: { id: existing.id },
          data: payload,
        })
      : await this.prisma.vonalpTerm.create({ data: payload });

    if (completionStatus === VonalpCompletionStatus.COMPLETE) {
      await this.setSourceVocabularyFlag(
        dto.sourceType,
        dto.sourceId,
        dto.vocabularyType,
        true,
      );
    }

    return this.withWorkflowMetadata(term, user);
  }

  async update(id: string, dto: UpdateVonalpTermDto, user: AuthUser) {
    const term = await this.prisma.vonalpTerm.findUnique({ where: { id } });
    if (!term || term.completionStatus === VonalpCompletionStatus.ARCHIVED) {
      throw new NotFoundException('Vocábulo VONALP não encontrado');
    }

    const source = await this.getSource(term.sourceType, term.sourceId);
    this.ensureCanManageSource(user, source);

    const nextFields = this.normalizeFields({
      term: dto.term ?? term.term,
      pronunciation: dto.pronunciation ?? term.pronunciation,
      grammaticalCategory: dto.grammaticalCategory ?? term.grammaticalCategory,
      grammaticalSubcategory:
        dto.grammaticalSubcategory ?? term.grammaticalSubcategory,
      syllabicDivision: dto.syllabicDivision ?? term.syllabicDivision,
      etymology: dto.etymology ?? term.etymology,
      firstDefinition: dto.firstDefinition ?? term.firstDefinition,
      secondDefinition: dto.secondDefinition ?? term.secondDefinition,
      origin: dto.origin ?? term.origin,
    });
    const missingFields = this.getMissingFields(nextFields);
    const canSaveIncomplete = user.role !== UserRole.OPERATOR;

    if (
      missingFields.length > 0 &&
      (!dto.saveIncomplete || !canSaveIncomplete)
    ) {
      throw new BadRequestException({
        message: canSaveIncomplete
          ? 'Preencha todos os campos obrigatórios ou guarde como incompleto'
          : 'Preencha todos os campos obrigatórios antes de concluir a marcação',
        missingFields,
      });
    }

    const completionStatus =
      missingFields.length === 0
        ? VonalpCompletionStatus.COMPLETE
        : VonalpCompletionStatus.INCOMPLETE;

    const updated = await this.prisma.vonalpTerm.update({
      where: { id },
      data: {
        ...nextFields,
        missingFields,
        completionStatus,
        completedAt:
          completionStatus === VonalpCompletionStatus.COMPLETE
            ? new Date()
            : null,
        updatedById: user.id,
      },
    });

    await this.setSourceVocabularyFlag(
      term.sourceType,
      term.sourceId,
      term.vocabularyType,
      true,
    );

    return this.withWorkflowMetadata(updated, user);
  }

  async unmark(dto: MarkVonalpDto, user: AuthUser) {
    const source = await this.getSource(dto.sourceType, dto.sourceId);
    this.ensureCanManageSource(user, source);

    const existing = await this.prisma.vonalpTerm.findUnique({
      where: {
        vocabularyType_sourceType_sourceId: {
          vocabularyType: dto.vocabularyType,
          sourceType: dto.sourceType,
          sourceId: dto.sourceId,
        },
      },
    });

    if (existing) {
      await this.prisma.vonalpTerm.update({
        where: { id: existing.id },
        data: {
          completionStatus: VonalpCompletionStatus.ARCHIVED,
          updatedById: user.id,
        },
      });
    }

    await this.setSourceVocabularyFlag(
      dto.sourceType,
      dto.sourceId,
      dto.vocabularyType,
      false,
    );

    return { success: true };
  }

  async findAll(filters: VonalpFilterDto, user: AuthUser) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 20);
    const where: Prisma.VonalpTermWhereInput = {
      ...(filters.vocabularyType
        ? { vocabularyType: filters.vocabularyType }
        : {}),
      ...(filters.sourceType ? { sourceType: filters.sourceType } : {}),
      ...(filters.completionStatus
        ? { completionStatus: filters.completionStatus }
        : { completionStatus: { not: VonalpCompletionStatus.ARCHIVED } }),
      ...(filters.search
        ? { term: { contains: filters.search, mode: 'insensitive' } }
        : {}),
    };

    if (user.role === UserRole.OPERATOR) {
      where.sourceCreatedById = user.id;
    }

    if (user.role === UserRole.SUPERVISOR) {
      where.OR = [
        { sourceCreatedById: user.id },
        { sourceCreatedBy: { supervisorId: user.id } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vonalpTerm.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          updatedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          sourceCreatedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      this.prisma.vonalpTerm.count({ where }),
    ]);

    return {
      data: data.map((term) => this.withWorkflowMetadata(term, user)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublic(vocabularyType: VonalpVocabularyType) {
    const terms = await this.prisma.vonalpTerm.findMany({
      where: {
        vocabularyType,
        completionStatus: VonalpCompletionStatus.COMPLETE,
      },
      orderBy: { term: 'asc' },
    });

    const approvedIds = await this.getApprovedSourceIds(terms);

    const termItems = terms
      .filter((term) => approvedIds[term.sourceType].has(term.sourceId))
      .map((term) => ({
        id: term.id,
        vocabularyType: term.vocabularyType,
        sourceType: term.sourceType,
        sourceId: term.sourceId,
        sourceLabel: this.publicSourceLabel(term.sourceType),
        term: term.term,
        pronunciation: term.pronunciation,
        grammaticalCategory: term.grammaticalCategory,
        grammaticalSubcategory: term.grammaticalSubcategory,
        syllabicDivision: term.syllabicDivision,
        etymology: term.etymology,
        firstDefinition: term.firstDefinition,
        secondDefinition: term.secondDefinition,
        origin: term.origin,
      }));

    const existingKeys = new Set(
      termItems.map((term) => this.sourceKey(term.sourceType, term.sourceId)),
    );
    const markedItems = await this.findPublicMarkedSources(
      vocabularyType,
      existingKeys,
    );

    return [...termItems, ...markedItems].sort((a, b) =>
      String(a.term || '').localeCompare(String(b.term || ''), 'pt'),
    );
  }

  private async findPublicMarkedSources(
    vocabularyType: VonalpVocabularyType,
    existingKeys: Set<string>,
  ) {
    const flag =
      vocabularyType === VonalpVocabularyType.VONALP
        ? 'isVocabulary'
        : 'isVocabularyEP';

    const [entries, toponyms, anthroponyms, foreignisms] = await Promise.all([
      this.prisma.entry.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, [flag]: true },
        orderBy: { entry: 'asc' },
        select: {
          id: true,
          entry: true,
          pronunciation: true,
          grammaticalCategory: true,
          grammaticalSubcategory: true,
          syllabicDivision: true,
          etymology: true,
          firstDefinition: true,
          secondDefinition: true,
        },
      }),
      this.prisma.toponym.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, [flag]: true },
        orderBy: { toponym: 'asc' },
        select: {
          id: true,
          toponym: true,
          pronunciation: true,
          meaning: true,
          toponymProvenance: true,
          toponymHistory: true,
        },
      }),
      this.prisma.anthroponym.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, [flag]: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          gender: true,
          etymology: true,
          meaning: true,
        },
      }),
      this.prisma.foreignism.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, [flag]: true },
        orderBy: { term: 'asc' },
        select: {
          id: true,
          term: true,
          pronunciation: true,
          grammaticalCategory: true,
          originalLanguage: true,
          originCountry: true,
          definition: true,
          meaning: true,
        },
      }),
    ]);

    return [
      ...entries.map((source) =>
        this.publicSourceTerm(vocabularyType, VonalpSourceType.ENTRY, source),
      ),
      ...toponyms.map((source) =>
        this.publicSourceTerm(vocabularyType, VonalpSourceType.TOPONYM, source),
      ),
      ...anthroponyms.map((source) =>
        this.publicSourceTerm(
          vocabularyType,
          VonalpSourceType.ANTHROPONYM,
          source,
        ),
      ),
      ...foreignisms.map((source) =>
        this.publicSourceTerm(
          vocabularyType,
          VonalpSourceType.FOREIGNISM,
          source,
        ),
      ),
    ].filter(
      (term) =>
        !existingKeys.has(this.sourceKey(term.sourceType, term.sourceId)),
    );
  }

  private publicSourceTerm(
    vocabularyType: VonalpVocabularyType,
    sourceType: VonalpSourceType,
    source: SourceRecord,
  ) {
    const fields = this.mapSourceToVonalpFields(sourceType, source);

    return {
      id: `${vocabularyType}:${sourceType}:${source.id}`,
      vocabularyType,
      sourceType,
      sourceId: source.id,
      sourceLabel: this.publicSourceLabel(sourceType),
      ...fields,
    };
  }

  private publicSourceLabel(sourceType: VonalpSourceType) {
    return SOURCE_CONFIG[sourceType].origin;
  }

  private sourceKey(sourceType: VonalpSourceType, sourceId: string) {
    return `${sourceType}:${sourceId}`;
  }

  private async getSource(
    sourceType: VonalpSourceType,
    sourceId: string,
  ): Promise<SourceRecord> {
    const include = {
      createdBy: { select: { id: true, supervisorId: true } },
    } as const;

    switch (sourceType) {
      case VonalpSourceType.ENTRY:
        return this.requireSource(
          await this.prisma.entry.findUnique({
            where: { id: sourceId },
            include,
          }),
        );
      case VonalpSourceType.TOPONYM:
        return this.requireSource(
          await this.prisma.toponym.findUnique({
            where: { id: sourceId },
            include,
          }),
        );
      case VonalpSourceType.ANTHROPONYM:
        return this.requireSource(
          await this.prisma.anthroponym.findUnique({
            where: { id: sourceId },
            include,
          }),
        );
      case VonalpSourceType.FOREIGNISM:
        return this.requireSource(
          await this.prisma.foreignism.findUnique({
            where: { id: sourceId },
            include,
          }),
        );
    }
  }

  private requireSource(source: SourceRecord | null): SourceRecord {
    if (!source) {
      throw new NotFoundException('Registo de origem não encontrado');
    }

    return source;
  }

  private ensureCanManageSource(user: AuthUser, source: SourceRecord) {
    if (user.role === UserRole.ADMIN) return;

    if (user.role === UserRole.OPERATOR) {
      if (source.createdById !== user.id) {
        throw new ForbiddenException('Sem permissão para gerir este registo');
      }
      return;
    }

    if (user.role === UserRole.SUPERVISOR) {
      const isOwner = source.createdById === user.id;
      const managesCreator = source.createdBy?.supervisorId === user.id;
      if (!isOwner && !managesCreator) {
        throw new ForbiddenException(
          'Supervisor só pode gerir os seus operadores atribuídos',
        );
      }
    }
  }

  private mapSourceToVonalpFields(
    sourceType: VonalpSourceType,
    source: SourceRecord,
  ): VonalpFields {
    if (sourceType === VonalpSourceType.ENTRY) {
      return this.normalizeFields({
        term: source.entry ?? null,
        pronunciation: source.pronunciation ?? null,
        grammaticalCategory: source.grammaticalCategory ?? null,
        grammaticalSubcategory: source.grammaticalSubcategory ?? null,
        syllabicDivision: source.syllabicDivision ?? null,
        etymology: source.etymology ?? null,
        firstDefinition: source.firstDefinition ?? null,
        secondDefinition: source.secondDefinition ?? null,
        origin: SOURCE_CONFIG[sourceType].origin,
      });
    }

    if (sourceType === VonalpSourceType.TOPONYM) {
      return this.normalizeFields({
        term: source.toponym ?? null,
        pronunciation: source.pronunciation ?? null,
        grammaticalCategory: null,
        grammaticalSubcategory: null,
        syllabicDivision: null,
        etymology: source.toponymProvenance ?? source.toponymHistory ?? null,
        firstDefinition: source.meaning ?? null,
        secondDefinition: null,
        origin: SOURCE_CONFIG[sourceType].origin,
      });
    }

    if (sourceType === VonalpSourceType.ANTHROPONYM) {
      return this.normalizeFields({
        term: source.name ?? null,
        pronunciation: null,
        grammaticalCategory: null,
        grammaticalSubcategory: source.gender ?? null,
        syllabicDivision: null,
        etymology: source.etymology ?? null,
        firstDefinition: source.meaning ?? null,
        secondDefinition: null,
        origin: SOURCE_CONFIG[sourceType].origin,
      });
    }

    return this.normalizeFields({
      term: source.term ?? null,
      pronunciation: source.pronunciation ?? null,
      grammaticalCategory: source.grammaticalCategory ?? null,
      grammaticalSubcategory: null,
      syllabicDivision: null,
      etymology: this.buildForeignismEtymology(source) || null,
      firstDefinition: source.definition ?? source.meaning ?? null,
      secondDefinition: null,
      origin: SOURCE_CONFIG[sourceType].origin,
    });
  }

  private normalizeFields(fields: VonalpFields): VonalpFields {
    return Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() || null : (value ?? null),
      ]),
    ) as VonalpFields;
  }

  private buildForeignismEtymology(source: SourceRecord) {
    const parts = [
      source.originalLanguage
        ? `Idioma original: ${source.originalLanguage}`
        : '',
      source.originCountry ? `País de origem: ${source.originCountry}` : '',
    ].filter(Boolean);

    return parts.length > 0 ? parts.join('; ') : null;
  }

  private getMissingFields(fields: Partial<VonalpFields>) {
    return REQUIRED_FIELDS.filter((field) => this.isEmpty(fields[field]));
  }

  private isEmpty(value: unknown) {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  private async setSourceVocabularyFlag(
    sourceType: VonalpSourceType,
    sourceId: string,
    vocabularyType: VonalpVocabularyType,
    enabled: boolean,
  ) {
    const config = this.getSourceConfig(sourceType, vocabularyType);
    const data = { [config.vocabularyFlag]: enabled };
    switch (config.delegateName) {
      case 'entry':
        await this.prisma.entry.update({ where: { id: sourceId }, data });
        break;
      case 'toponym':
        await this.prisma.toponym.update({ where: { id: sourceId }, data });
        break;
      case 'anthroponym':
        await this.prisma.anthroponym.update({ where: { id: sourceId }, data });
        break;
      case 'foreignism':
        await this.prisma.foreignism.update({ where: { id: sourceId }, data });
        break;
    }
  }

  private getSourceConfig(
    sourceType: VonalpSourceType,
    vocabularyType: VonalpVocabularyType,
  ): SourceConfig {
    return {
      ...SOURCE_CONFIG[sourceType],
      vocabularyFlag:
        vocabularyType === VonalpVocabularyType.VONALP
          ? 'isVocabulary'
          : 'isVocabularyEP',
    };
  }

  private async getApprovedSourceIds(terms: VonalpTerm[]) {
    const idsByType = {
      [VonalpSourceType.ENTRY]: new Set<string>(),
      [VonalpSourceType.TOPONYM]: new Set<string>(),
      [VonalpSourceType.ANTHROPONYM]: new Set<string>(),
      [VonalpSourceType.FOREIGNISM]: new Set<string>(),
    };

    for (const term of terms) {
      idsByType[term.sourceType].add(term.sourceId);
    }

    const [entries, toponyms, anthroponyms, foreignisms] = await Promise.all([
      this.prisma.entry.findMany({
        where: {
          id: { in: Array.from(idsByType.ENTRY) },
          approvalStatus: ApprovalStatus.APPROVED,
        },
        select: { id: true },
      }),
      this.prisma.toponym.findMany({
        where: {
          id: { in: Array.from(idsByType.TOPONYM) },
          approvalStatus: ApprovalStatus.APPROVED,
        },
        select: { id: true },
      }),
      this.prisma.anthroponym.findMany({
        where: {
          id: { in: Array.from(idsByType.ANTHROPONYM) },
          approvalStatus: ApprovalStatus.APPROVED,
        },
        select: { id: true },
      }),
      this.prisma.foreignism.findMany({
        where: {
          id: { in: Array.from(idsByType.FOREIGNISM) },
          approvalStatus: ApprovalStatus.APPROVED,
        },
        select: { id: true },
      }),
    ]);

    return {
      [VonalpSourceType.ENTRY]: new Set(entries.map((item) => item.id)),
      [VonalpSourceType.TOPONYM]: new Set(toponyms.map((item) => item.id)),
      [VonalpSourceType.ANTHROPONYM]: new Set(
        anthroponyms.map((item) => item.id),
      ),
      [VonalpSourceType.FOREIGNISM]: new Set(
        foreignisms.map((item) => item.id),
      ),
    };
  }

  private withWorkflowMetadata<T extends VonalpTerm>(term: T, user: AuthUser) {
    const missingFields = this.getMissingFields(term);
    return {
      ...term,
      missingFields,
      requiresModal:
        term.completionStatus !== VonalpCompletionStatus.COMPLETE &&
        missingFields.length > 0,
      canSaveIncomplete: user.role !== UserRole.OPERATOR,
    };
  }
}
