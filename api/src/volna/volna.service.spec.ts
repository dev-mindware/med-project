import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ApprovalStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VolnaService } from './volna.service';

const admin = { id: 'admin-1', role: UserRole.ADMIN };
const operator = { id: 'operator-1', role: UserRole.OPERATOR };

function makeTerm(overrides: Record<string, any> = {}) {
  return {
    id: 'volna-1',
    term: 'kamba',
    language: 'Kimbundu',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'common_noun',
    definition: 'Amigo.',
    usageExample: 'Kamba wa mono.',
    notes: null,
    approvalStatus: ApprovalStatus.DRAFT,
    createdById: operator.id,
    updatedById: operator.id,
    approvedById: null,
    approvedAt: null,
    submittedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    correctionNotes: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('VolnaService', () => {
  let service: VolnaService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      volnaTerm: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new VolnaService(prisma as PrismaService);
  });

  it('cria vocábulo VOLNA normalizado como rascunho', async () => {
    const created = makeTerm();
    prisma.volnaTerm.findFirst.mockResolvedValueOnce(null);
    prisma.volnaTerm.create.mockResolvedValueOnce(created);

    const result = await service.create(
      { term: ' kamba ', language: ' Kimbundu ', definition: ' Amigo. ' },
      operator,
    );

    expect(result).toBe(created);
    expect(prisma.volnaTerm.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        term: 'kamba',
        language: 'Kimbundu',
        definition: 'Amigo.',
        createdById: operator.id,
        updatedById: operator.id,
        approvalStatus: ApprovalStatus.DRAFT,
      }),
      include: expect.any(Object),
    });
  });

  it('bloqueia duplicados por vocábulo e língua', async () => {
    prisma.volnaTerm.findFirst.mockResolvedValueOnce({ id: 'existing' });

    await expect(
      service.create(
        { term: 'kamba', language: 'Kimbundu', definition: 'Amigo.' },
        operator,
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.volnaTerm.create).not.toHaveBeenCalled();
  });

  it('lista vocábulos publicados no formato público paginado', async () => {
    const term = makeTerm({ approvalStatus: ApprovalStatus.APPROVED });
    prisma.volnaTerm.findMany.mockResolvedValueOnce([term]);
    prisma.volnaTerm.count.mockResolvedValueOnce(1);

    const result = await service.findPublic({
      search: 'kam',
      language: 'Kimbundu',
      page: 1,
      limit: 6,
    });

    expect(result).toEqual({
      data: [term],
      meta: {
        total: 1,
        page: 1,
        limit: 6,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    expect(prisma.volnaTerm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          approvalStatus: ApprovalStatus.APPROVED,
          language: { equals: 'Kimbundu', mode: 'insensitive' },
        }),
        take: 6,
      }),
    );
  });

  it('impede operador de editar vocábulo aprovado', async () => {
    prisma.volnaTerm.findUnique.mockResolvedValueOnce(
      makeTerm({ approvalStatus: ApprovalStatus.APPROVED }),
    );

    await expect(
      service.update('volna-1', { definition: 'Nova definição.' }, operator),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.volnaTerm.update).not.toHaveBeenCalled();
  });

  it('não acede a nenhuma model de marcação ao remover', async () => {
    const term = makeTerm();
    prisma.volnaTerm.findUnique.mockResolvedValueOnce(term);
    prisma.volnaTerm.delete.mockResolvedValueOnce(term);

    await service.remove('volna-1', operator);

    expect(prisma.volnaTerm.delete).toHaveBeenCalledWith({
      where: { id: 'volna-1' },
      include: expect.any(Object),
    });
    expect(prisma.vonalpTerm).toBeUndefined();
  });
});
