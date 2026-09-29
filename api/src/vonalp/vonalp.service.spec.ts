import { BadRequestException } from '@nestjs/common';
import {
  ApprovalStatus,
  UserRole,
  VonalpCompletionStatus,
  VonalpSourceType,
  VonalpVocabularyType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VonalpService } from './vonalp.service';

const operator = { id: 'operator-1', role: UserRole.OPERATOR };
const admin = { id: 'admin-1', role: UserRole.ADMIN };

const sourceEntry = {
  id: 'entry-1',
  entry: 'Casa',
  pronunciation: 'ka.za',
  grammaticalCategory: 'noun',
  grammaticalSubcategory: 'feminine',
  syllabicDivision: 'ca-sa',
  etymology: 'Latim casa',
  firstDefinition: 'Habitacao',
  secondDefinition: null,
  approvalStatus: ApprovalStatus.APPROVED,
  createdById: operator.id,
  createdBy: { id: operator.id, supervisorId: 'supervisor-1' },
};

function makeTerm(overrides: Record<string, unknown> = {}) {
  return {
    id: 'vonalp-1',
    vocabularyType: VonalpVocabularyType.VONALP,
    sourceType: VonalpSourceType.ENTRY,
    sourceId: sourceEntry.id,
    sourceCreatedById: operator.id,
    term: sourceEntry.entry,
    pronunciation: sourceEntry.pronunciation,
    grammaticalCategory: sourceEntry.grammaticalCategory,
    grammaticalSubcategory: sourceEntry.grammaticalSubcategory,
    syllabicDivision: sourceEntry.syllabicDivision,
    etymology: sourceEntry.etymology,
    firstDefinition: sourceEntry.firstDefinition,
    secondDefinition: sourceEntry.secondDefinition,
    origin: 'Entrada',
    completionStatus: VonalpCompletionStatus.INCOMPLETE,
    missingFields: ['secondDefinition'],
    createdById: operator.id,
    updatedById: operator.id,
    completedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function createPrismaMock() {
  return {
    entry: {
      findUnique: jest.fn().mockResolvedValue(sourceEntry),
      update: jest.fn().mockResolvedValue(sourceEntry),
      findMany: jest.fn().mockResolvedValue([{ id: sourceEntry.id }]),
    },
    toponym: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    anthroponym: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    foreignism: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    vonalpTerm: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(async ({ data }) => makeTerm(data)),
      update: jest.fn(async ({ data }) => makeTerm(data)),
      findMany: jest
        .fn()
        .mockResolvedValue([
          makeTerm({
            completionStatus: VonalpCompletionStatus.COMPLETE,
            missingFields: [],
          }),
        ]),
      count: jest.fn().mockResolvedValue(1),
    },
  };
}

describe('VonalpService', () => {
  let service: VonalpService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new VonalpService(prisma as unknown as PrismaService);
  });

  it('creates a dedicated complete copy when only second definition is missing', async () => {
    const result = await service.mark(
      {
        sourceType: VonalpSourceType.ENTRY,
        sourceId: sourceEntry.id,
        vocabularyType: VonalpVocabularyType.VONALP,
      },
      operator,
    );

    expect(result.completionStatus).toBe(VonalpCompletionStatus.COMPLETE);
    expect(result.missingFields).toEqual([]);
    expect(result.requiresModal).toBe(false);
    expect(prisma.vonalpTerm.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sourceId: sourceEntry.id,
        sourceCreatedById: operator.id,
        term: 'Casa',
        firstDefinition: 'Habitacao',
        origin: 'Dicionário',
      }),
    });
    expect(prisma.entry.update).toHaveBeenCalledWith({
      where: { id: sourceEntry.id },
      data: { isVocabulary: true },
    });
  });

  it('reuses an existing complete copy and prevents duplicates', async () => {
    prisma.vonalpTerm.findUnique.mockResolvedValueOnce(
      makeTerm({
        completionStatus: VonalpCompletionStatus.COMPLETE,
        missingFields: [],
        secondDefinition: 'Morada',
        completedAt: new Date('2026-01-02'),
      }),
    );

    const result = await service.mark(
      {
        sourceType: VonalpSourceType.ENTRY,
        sourceId: sourceEntry.id,
        vocabularyType: VonalpVocabularyType.VONALP,
      },
      operator,
    );

    expect(result.completionStatus).toBe(VonalpCompletionStatus.COMPLETE);
    expect(prisma.vonalpTerm.create).not.toHaveBeenCalled();
    expect(prisma.entry.update).toHaveBeenCalledWith({
      where: { id: sourceEntry.id },
      data: { isVocabulary: true },
    });
  });

  it('blocks operators from saving incomplete VONALP terms', async () => {
    prisma.vonalpTerm.findUnique.mockResolvedValueOnce(
      makeTerm({
        pronunciation: null,
        missingFields: ['pronunciation'],
      }),
    );

    await expect(
      service.update('vonalp-1', { saveIncomplete: true }, operator),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.vonalpTerm.update).not.toHaveBeenCalled();
  });

  it('allows admin to save an incomplete term and sets the original flag', async () => {
    prisma.vonalpTerm.findUnique.mockResolvedValueOnce(
      makeTerm({
        pronunciation: null,
        missingFields: ['pronunciation'],
      }),
    );

    const result = await service.update(
      'vonalp-1',
      { saveIncomplete: true },
      admin,
    );

    expect(result.completionStatus).toBe(VonalpCompletionStatus.INCOMPLETE);
    expect(prisma.vonalpTerm.update).toHaveBeenCalledWith({
      where: { id: 'vonalp-1' },
      data: expect.objectContaining({
        completionStatus: VonalpCompletionStatus.INCOMPLETE,
        missingFields: ['pronunciation'],
        updatedById: admin.id,
      }),
    });
    expect(prisma.entry.update).toHaveBeenCalledWith({
      where: { id: sourceEntry.id },
      data: { isVocabulary: true },
    });
  });

  it('archives the dedicated copy and removes the source flag when unmarked', async () => {
    prisma.vonalpTerm.findUnique.mockResolvedValueOnce(makeTerm());

    await service.unmark(
      {
        sourceType: VonalpSourceType.ENTRY,
        sourceId: sourceEntry.id,
        vocabularyType: VonalpVocabularyType.VONALP,
      },
      operator,
    );

    expect(prisma.vonalpTerm.update).toHaveBeenCalledWith({
      where: { id: 'vonalp-1' },
      data: {
        completionStatus: VonalpCompletionStatus.ARCHIVED,
        updatedById: operator.id,
      },
    });
    expect(prisma.entry.update).toHaveBeenCalledWith({
      where: { id: sourceEntry.id },
      data: { isVocabulary: false },
    });
  });

  it('returns public vocabulary terms only when their source is approved', async () => {
    prisma.vonalpTerm.findMany.mockResolvedValueOnce([
      makeTerm({
        id: 'approved-term',
        sourceId: 'entry-approved',
        completionStatus: VonalpCompletionStatus.COMPLETE,
        missingFields: [],
        secondDefinition: 'Morada',
      }),
      makeTerm({
        id: 'pending-term',
        sourceId: 'entry-pending',
        completionStatus: VonalpCompletionStatus.COMPLETE,
        missingFields: [],
        secondDefinition: 'Residencia',
      }),
    ]);
    prisma.entry.findMany
      .mockResolvedValueOnce([{ id: 'entry-approved' }])
      .mockResolvedValueOnce([]);

    const result = await service.findPublic(VonalpVocabularyType.VONALP);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('approved-term');
    expect(prisma.entry.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['entry-approved', 'entry-pending'] },
        approvalStatus: ApprovalStatus.APPROVED,
      },
      select: { id: true },
    });
  });
});
