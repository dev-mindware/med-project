import {
  ApprovalStatus,
  PrismaClient,
  UserRole,
  VonalpSourceType,
  VonalpVocabularyType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import {
  buildCompleteVonalpTerm,
  demoAnthroponyms,
  demoBlogPosts,
  demoEntries,
  demoEvents,
  demoForeignisms,
  demoNeologisms,
  demoToponyms,
  demoUsers,
  demoVolnaTerms,
  VONALP_ORIGINS,
} from './seed-data';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_MARKER_EMAIL = 'supervisor@linguistic.com';
const MIN_DEMO_ENTRIES = 15;

type UserMap = Record<string, string>;

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function approvalTimestamps(status: ApprovalStatus) {
  const now = new Date();
  switch (status) {
    case ApprovalStatus.APPROVED:
      return {
        submittedAt: daysAgo(5),
        approvedAt: daysAgo(2),
      };
    case ApprovalStatus.PENDING_APPROVAL:
      return { submittedAt: daysAgo(1) };
    case ApprovalStatus.REJECTED:
      return {
        submittedAt: daysAgo(4),
        rejectedAt: daysAgo(2),
      };
    case ApprovalStatus.NEEDS_CORRECTION:
      return {
        submittedAt: daysAgo(3),
        correctionNotes: 'Rever definição e exemplos.',
      };
    default:
      return {};
  }
}

async function shouldSeedDemo(): Promise<boolean> {
  if (process.env.FORCE_DEMO_SEED === 'true') return true;
  const entryCount = await prisma.entry.count();
  return entryCount < MIN_DEMO_ENTRIES;
}

async function clearDemoContent() {
  console.log('A limpar conteúdo de demonstração existente...');

  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.vonalpTerm.deleteMany();
  await prisma.volnaTerm.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.neologism.deleteMany();
  await prisma.foreignism.deleteMany();
  await prisma.anthroponym.deleteMany();
  await prisma.toponym.deleteMany();
  await prisma.entry.deleteMany();
}

async function seedUsers(): Promise<UserMap> {
  const userIds: UserMap = {};

  for (const user of demoUsers) {
    const passwordHash = await argon2.hash(user.password);
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        isActive: true,
      },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
        isActive: true,
        emailVerifiedAt: new Date(),
        lastLogin: daysAgo(1),
      },
    });
    userIds[user.email] = upserted.id;
  }

  for (const user of demoUsers) {
    if ('supervisorEmail' in user && user.supervisorEmail) {
      await prisma.user.update({
        where: { id: userIds[user.email] },
        data: { supervisorId: userIds[user.supervisorEmail] },
      });
    }
  }

  return userIds;
}

async function seedEntries(userIds: UserMap) {
  const created: Array<{ id: string; seed: (typeof demoEntries)[number] }> = [];

  for (const item of demoEntries) {
    const existing = await prisma.entry.findFirst({
      where: { entry: { equals: item.entry, mode: 'insensitive' } },
    });
    if (existing) {
      created.push({ id: existing.id, seed: item });
      continue;
    }

    const timestamps = approvalTimestamps(item.approvalStatus);
    const record = await prisma.entry.create({
      data: {
        entry: item.entry,
        pronunciation: item.pronunciation,
        syllabicDivision: item.syllabicDivision,
        etymology: item.etymology,
        firstDefinition: item.firstDefinition,
        secondDefinition: item.secondDefinition,
        thirdDefinition: item.thirdDefinition,
        usageExample: item.usageExample,
        grammaticalCategory: item.grammaticalCategory,
        grammaticalSubcategory: item.grammaticalSubcategory,
        grammaticalStatus: item.grammaticalStatus,
        languageCode: item.languageCode,
        isVocabulary: item.isVocabulary ?? false,
        isVocabularyEP: item.isVocabularyEP ?? false,
        approvalStatus: item.approvalStatus,
        createdById: userIds[item.creatorEmail],
        updatedById: userIds[item.creatorEmail],
        approvedById: item.approverEmail ? userIds[item.approverEmail] : undefined,
        rejectionReason: item.rejectionReason,
        correctionNotes: item.correctionNotes,
        ...timestamps,
      },
    });
    created.push({ id: record.id, seed: item });
  }

  return created;
}

async function seedToponyms(userIds: UserMap) {
  const created: Array<{ id: string; seed: (typeof demoToponyms)[number] }> = [];

  for (const item of demoToponyms) {
    const existing = await prisma.toponym.findFirst({
      where: { toponym: { equals: item.toponym, mode: 'insensitive' } },
    });
    if (existing) {
      created.push({ id: existing.id, seed: item });
      continue;
    }

    const timestamps = approvalTimestamps(item.approvalStatus);
    const record = await prisma.toponym.create({
      data: {
        toponym: item.toponym,
        pronunciation: item.pronunciation,
        meaning: item.meaning,
        province: item.province,
        municipality: item.municipality,
        location: item.location,
        gentilic: item.gentilic,
        toponymHistory: item.toponymHistory,
        toponymProvenance: item.toponymProvenance,
        commonUsage: item.commonUsage,
        toponymClasses: item.toponymClasses,
        toponymSubclasses: item.toponymSubclasses,
        status: item.status,
        isVocabulary: item.isVocabulary ?? false,
        isVocabularyEP: item.isVocabularyEP ?? false,
        approvalStatus: item.approvalStatus,
        createdById: userIds[item.creatorEmail],
        approvedById: item.approverEmail ? userIds[item.approverEmail] : undefined,
        ...timestamps,
      },
    });
    created.push({ id: record.id, seed: item });
  }

  return created;
}

async function seedAnthroponyms(userIds: UserMap) {
  const created: Array<{ id: string; seed: (typeof demoAnthroponyms)[number] }> = [];

  for (const item of demoAnthroponyms) {
    const existing = await prisma.anthroponym.findFirst({
      where: { name: { equals: item.name, mode: 'insensitive' } },
    });
    if (existing) {
      created.push({ id: existing.id, seed: item });
      continue;
    }

    const timestamps = approvalTimestamps(item.approvalStatus);
    const record = await prisma.anthroponym.create({
      data: {
        name: item.name,
        gender: item.gender,
        etymology: item.etymology,
        meaning: item.meaning,
        surname: item.surname,
        historicalFigure: item.historicalFigure,
        historicalFigureDomain: item.historicalFigureDomain,
        isVocabulary: item.isVocabulary ?? false,
        approvalStatus: item.approvalStatus,
        createdById: userIds[item.creatorEmail],
        approvedById: item.approverEmail ? userIds[item.approverEmail] : undefined,
        ...timestamps,
      },
    });
    created.push({ id: record.id, seed: item });
  }

  return created;
}

async function seedForeignisms(userIds: UserMap) {
  const created: Array<{ id: string; seed: (typeof demoForeignisms)[number] }> = [];

  for (const item of demoForeignisms) {
    const existing = await prisma.foreignism.findFirst({
      where: { term: { equals: item.term, mode: 'insensitive' } },
    });
    if (existing) {
      created.push({ id: existing.id, seed: item });
      continue;
    }

    const timestamps = approvalTimestamps(item.approvalStatus);
    const record = await prisma.foreignism.create({
      data: {
        term: item.term,
        pronunciation: item.pronunciation,
        originalLanguage: item.originalLanguage,
        originCountry: item.originCountry,
        adaptedForm: item.adaptedForm,
        originalForm: item.originalForm,
        meaning: item.meaning,
        definition: item.definition,
        usageExample: item.usageExample,
        context: item.context,
        field: item.field,
        grammaticalCategory: item.grammaticalCategory,
        isVocabulary: item.isVocabulary ?? false,
        approvalStatus: item.approvalStatus,
        createdById: userIds[item.creatorEmail],
        approvedById: item.approverEmail ? userIds[item.approverEmail] : undefined,
        ...timestamps,
      },
    });
    created.push({ id: record.id, seed: item });
  }

  return created;
}

async function seedNeologisms(userIds: UserMap) {
  for (const item of demoNeologisms) {
    const existing = await prisma.neologism.findFirst({
      where: { entry: { equals: item.entry, mode: 'insensitive' } },
    });
    if (existing) continue;

    const timestamps = approvalTimestamps(item.approvalStatus);
    await prisma.neologism.create({
      data: {
        entry: item.entry,
        pronunciation: item.pronunciation,
        etymology: item.etymology,
        firstDefinition: item.firstDefinition,
        usageExample: item.usageExample,
        grammaticalCategory: item.grammaticalCategory,
        approvalStatus: item.approvalStatus,
        createdById: userIds[item.creatorEmail],
        approvedById: item.approverEmail ? userIds[item.approverEmail] : undefined,
        ...timestamps,
      },
    });
  }
}

async function seedVolnaTerms(userIds: UserMap) {
  for (const item of demoVolnaTerms) {
    const existing = await prisma.volnaTerm.findFirst({
      where: { term: item.term, language: item.language },
    });
    if (existing) continue;

    const timestamps = approvalTimestamps(item.approvalStatus);
    await prisma.volnaTerm.create({
      data: {
        term: item.term,
        language: item.language,
        grammaticalCategory: item.grammaticalCategory,
        grammaticalSubcategory: item.grammaticalSubcategory,
        definition: item.definition,
        usageExample: item.usageExample,
        notes: item.notes,
        approvalStatus: item.approvalStatus,
        createdById: userIds[item.creatorEmail],
        approvedById: item.approverEmail ? userIds[item.approverEmail] : undefined,
        ...timestamps,
      },
    });
  }
}

async function seedVonalpTerms(
  userIds: UserMap,
  entries: Awaited<ReturnType<typeof seedEntries>>,
  toponyms: Awaited<ReturnType<typeof seedToponyms>>,
  anthroponyms: Awaited<ReturnType<typeof seedAnthroponyms>>,
  foreignisms: Awaited<ReturnType<typeof seedForeignisms>>,
) {
  const adminId = userIds['admin@linguistic.com'];

  const upsertVonalp = async (
    vocabularyType: VonalpVocabularyType,
    sourceType: VonalpSourceType,
    sourceId: string,
    fields: ReturnType<typeof buildCompleteVonalpTerm>,
  ) => {
    await prisma.vonalpTerm.upsert({
      where: {
        vocabularyType_sourceType_sourceId: {
          vocabularyType,
          sourceType,
          sourceId,
        },
      },
      update: fields,
      create: fields,
    });
  };

  for (const { id, seed } of entries) {
    if (!seed.vonalp && !seed.vonalpEp) continue;
    if (seed.approvalStatus !== ApprovalStatus.APPROVED) continue;

    const base = buildCompleteVonalpTerm({
      vocabularyType: VonalpVocabularyType.VONALP,
      sourceType: VonalpSourceType.ENTRY,
      sourceId: id,
      term: seed.entry,
      pronunciation: seed.pronunciation ?? `/${seed.entry.toLowerCase()}/`,
      grammaticalCategory: seed.grammaticalCategory ?? 'noun',
      grammaticalSubcategory: seed.grammaticalSubcategory ?? 'common_noun',
      syllabicDivision: seed.syllabicDivision ?? seed.entry,
      etymology: seed.etymology ?? 'Origem lexical angolana.',
      firstDefinition: seed.firstDefinition,
      secondDefinition: seed.secondDefinition,
      origin: VONALP_ORIGINS[VonalpSourceType.ENTRY],
      sourceCreatedById: userIds[seed.creatorEmail],
      createdById: adminId,
    });

    if (seed.vonalp) {
      await upsertVonalp(VonalpVocabularyType.VONALP, VonalpSourceType.ENTRY, id, base);
    }
    if (seed.vonalpEp) {
      await upsertVonalp(
        VonalpVocabularyType.VONALP_EP,
        VonalpSourceType.ENTRY,
        id,
        { ...base, vocabularyType: VonalpVocabularyType.VONALP_EP },
      );
    }
  }

  for (const { id, seed } of toponyms) {
    if (!seed.vonalp || seed.approvalStatus !== ApprovalStatus.APPROVED) continue;

    const term = buildCompleteVonalpTerm({
      vocabularyType: VonalpVocabularyType.VONALP,
      sourceType: VonalpSourceType.TOPONYM,
      sourceId: id,
      term: seed.toponym,
      pronunciation: seed.pronunciation ?? `/${seed.toponym.toLowerCase()}/`,
      grammaticalCategory: 'noun',
      grammaticalSubcategory: 'proper_noun',
      syllabicDivision: seed.toponym,
      etymology: seed.toponymProvenance ?? seed.toponymHistory ?? 'Topónimo angolano.',
      firstDefinition: seed.meaning ?? `Designação geográfica: ${seed.toponym}.`,
      origin: VONALP_ORIGINS[VonalpSourceType.TOPONYM],
      sourceCreatedById: userIds[seed.creatorEmail],
      createdById: adminId,
    });

    await upsertVonalp(VonalpVocabularyType.VONALP, VonalpSourceType.TOPONYM, id, term);
    if (seed.isVocabularyEP) {
      await upsertVonalp(VonalpVocabularyType.VONALP_EP, VonalpSourceType.TOPONYM, id, {
        ...term,
        vocabularyType: VonalpVocabularyType.VONALP_EP,
      });
    }
  }

  for (const { id, seed } of anthroponyms) {
    if (!seed.vonalp || seed.approvalStatus !== ApprovalStatus.APPROVED) continue;

    const term = buildCompleteVonalpTerm({
      vocabularyType: VonalpVocabularyType.VONALP,
      sourceType: VonalpSourceType.ANTHROPONYM,
      sourceId: id,
      term: seed.name,
      pronunciation: `/${seed.name.toLowerCase()}/`,
      grammaticalCategory: 'noun',
      grammaticalSubcategory: seed.gender ?? 'neutral',
      syllabicDivision: seed.name,
      etymology: seed.etymology ?? 'Antropónimo de tradição angolana.',
      firstDefinition: seed.meaning ?? `Nome próprio: ${seed.name}.`,
      origin: VONALP_ORIGINS[VonalpSourceType.ANTHROPONYM],
      sourceCreatedById: userIds[seed.creatorEmail],
      createdById: adminId,
    });

    await upsertVonalp(VonalpVocabularyType.VONALP, VonalpSourceType.ANTHROPONYM, id, term);
  }

  for (const { id, seed } of foreignisms) {
    if (!seed.vonalp || seed.approvalStatus !== ApprovalStatus.APPROVED) continue;

    const etymology = [
      seed.originalLanguage ? `Idioma original: ${seed.originalLanguage}` : '',
      seed.originCountry ? `País de origem: ${seed.originCountry}` : '',
    ]
      .filter(Boolean)
      .join('; ') || 'Estrangeirismo adaptado ao português angolano.';

    const term = buildCompleteVonalpTerm({
      vocabularyType: VonalpVocabularyType.VONALP,
      sourceType: VonalpSourceType.FOREIGNISM,
      sourceId: id,
      term: seed.term,
      pronunciation: seed.pronunciation ?? `/${seed.term.toLowerCase()}/`,
      grammaticalCategory: seed.grammaticalCategory ?? 'noun',
      grammaticalSubcategory: 'common_noun',
      syllabicDivision: seed.term,
      etymology,
      firstDefinition: seed.definition,
      origin: VONALP_ORIGINS[VonalpSourceType.FOREIGNISM],
      sourceCreatedById: userIds[seed.creatorEmail],
      createdById: adminId,
    });

    await upsertVonalp(VonalpVocabularyType.VONALP, VonalpSourceType.FOREIGNISM, id, term);
  }
}

async function seedBlogPosts(userIds: UserMap) {
  for (const item of demoBlogPosts) {
    const publishedAt =
      item.status === 'PUBLISHED'
        ? daysAgo(item.daysAgo ?? 7)
        : undefined;

    await prisma.blogPost.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        type: item.type,
        status: item.status,
        category: item.category,
        tags: item.tags,
        isFeatured: item.isFeatured,
        coverImageUrl: item.coverImageUrl,
        publishedAt,
      },
      create: {
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        type: item.type,
        status: item.status,
        category: item.category,
        tags: item.tags,
        isFeatured: item.isFeatured,
        coverImageUrl: item.coverImageUrl,
        authorId: userIds[item.authorEmail],
        publishedAt,
      },
    });
  }
}

async function seedEvents(userIds: UserMap) {
  for (const item of demoEvents) {
    const startDate = daysFromNow(item.startDaysFromNow);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + item.durationDays);

    const event = await prisma.event.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        status: item.status,
        maxRegistrations: item.maxRegistrations,
        coverImageUrl: item.coverImageUrl,
        startDate,
        endDate,
        publishedAt: item.status === 'PUBLISHED' ? daysAgo(10) : undefined,
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        category: item.category,
        location: item.location,
        status: item.status,
        maxRegistrations: item.maxRegistrations,
        coverImageUrl: item.coverImageUrl,
        startDate,
        endDate,
        createdById: userIds[item.creatorEmail],
        publishedAt: item.status === 'PUBLISHED' ? daysAgo(10) : undefined,
      },
    });

    if (item.registrations?.length) {
      for (const reg of item.registrations) {
        await prisma.eventRegistration.upsert({
          where: {
            eventId_email: { eventId: event.id, email: reg.email },
          },
          update: {
            name: reg.name,
            phone: reg.phone,
            organization: reg.organization,
            status: reg.status,
            attended: reg.attended ?? false,
          },
          create: {
            eventId: event.id,
            name: reg.name,
            email: reg.email,
            phone: reg.phone,
            organization: reg.organization,
            status: reg.status,
            attended: reg.attended ?? false,
          },
        });
      }

      const approvedCount = item.registrations.filter(
        (r) => r.status === 'APPROVED' || r.status === 'ATTENDED',
      ).length;

      await prisma.event.update({
        where: { id: event.id },
        data: { registrationCount: approvedCount },
      });
    }
  }
}

async function seedNotifications(userIds: UserMap) {
  const supervisorId = userIds[DEMO_MARKER_EMAIL];
  const operatorId = userIds['operator@linguistic.com'];

  const notifications = [
    {
      userId: supervisorId,
      title: 'Conteúdo pendente de aprovação',
      message: '3 verbetes aguardam a sua revisão.',
      type: 'CONTENT_SUPERVISION',
      entity: 'Entry',
      readAt: null as Date | null,
    },
    {
      userId: supervisorId,
      title: 'Novo operador atribuído',
      message: 'João Kiluanje foi adicionado à sua equipa.',
      type: 'CONTENT_CREATED',
      readAt: daysAgo(2),
    },
    {
      userId: operatorId,
      title: 'Verbete aprovado',
      message: 'O verbete "Kizua" foi aprovado pelo supervisor.',
      type: 'CONTENT_STATUS_CHANGED',
      entity: 'Entry',
      readAt: daysAgo(1),
    },
    {
      userId: operatorId,
      title: 'Correção solicitada',
      message: 'O verbete "Correção solicitada" necessita de ajustes.',
      type: 'CONTENT_STATUS_CHANGED',
      entity: 'Entry',
      readAt: null,
    },
    {
      userId: userIds['admin@linguistic.com'],
      title: 'Relatório gerado',
      message: 'O relatório de actividade mensal está disponível.',
      type: 'REPORT_COMPLETED',
      readAt: daysAgo(3),
    },
  ];

  const existingCount = await prisma.notification.count();
  if (existingCount >= notifications.length) return;

  await prisma.notification.deleteMany();
  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }
}

async function seedAuditLogs(userIds: UserMap) {
  const existingCount = await prisma.auditLog.count();
  if (existingCount >= 8) return;

  const logs = [
    {
      actorId: userIds['operator@linguistic.com'],
      actorRole: UserRole.OPERATOR,
      action: 'CREATE',
      entity: 'Entry',
      status: 'SUCCESS',
      newValues: { entry: 'Kizua' },
    },
    {
      actorId: userIds[DEMO_MARKER_EMAIL],
      actorRole: UserRole.SUPERVISOR,
      action: 'APPROVE',
      entity: 'Entry',
      status: 'SUCCESS',
      newValues: { approvalStatus: 'APPROVED' },
    },
    {
      actorId: userIds['admin@linguistic.com'],
      actorRole: UserRole.ADMIN,
      action: 'CREATE',
      entity: 'BlogPost',
      status: 'SUCCESS',
      newValues: { title: 'CN-IILP apresenta o VONALP' },
    },
    {
      actorId: userIds['operator2@linguistic.com'],
      actorRole: UserRole.OPERATOR,
      action: 'CREATE',
      entity: 'Toponym',
      status: 'SUCCESS',
      newValues: { toponym: 'Lubango' },
    },
    {
      actorId: userIds[DEMO_MARKER_EMAIL],
      actorRole: UserRole.SUPERVISOR,
      action: 'REJECT',
      entity: 'Entry',
      status: 'SUCCESS',
      newValues: { approvalStatus: 'REJECTED' },
    },
    {
      actorId: userIds['admin@linguistic.com'],
      actorRole: UserRole.ADMIN,
      action: 'LOGIN',
      entity: 'User',
      status: 'SUCCESS',
    },
    {
      actorId: userIds['operator@linguistic.com'],
      actorRole: UserRole.OPERATOR,
      action: 'SUBMIT',
      entity: 'VolnaTerm',
      status: 'SUCCESS',
    },
    {
      actorId: userIds['admin@linguistic.com'],
      actorRole: UserRole.ADMIN,
      action: 'PUBLISH',
      entity: 'Event',
      status: 'SUCCESS',
    },
  ];

  await prisma.auditLog.deleteMany();
  for (const log of logs) {
    await prisma.auditLog.create({
      data: {
        ...log,
        createdAt: daysAgo(Math.floor(Math.random() * 14) + 1),
      },
    });
  }
}

async function seedReports(userIds: UserMap) {
  const existingCount = await prisma.report.count();
  if (existingCount >= 2) return;

  await prisma.report.deleteMany();
  await prisma.report.createMany({
    data: [
      {
        type: 'activity',
        status: 'COMPLETED',
        filename: 'relatorio-actividade-marco-2026.xlsx',
        url: 'https://example.com/reports/activity-march-2026.xlsx',
        generatedById: userIds['admin@linguistic.com'],
        parameters: { month: 3, year: 2026 },
        createdAt: daysAgo(5),
      },
      {
        type: 'summary',
        status: 'COMPLETED',
        filename: 'resumo-lexical-vonalp-2026.xlsx',
        url: 'https://example.com/reports/vonalp-summary-2026.xlsx',
        generatedById: userIds[DEMO_MARKER_EMAIL],
        parameters: { vocabularyType: 'VONALP' },
        createdAt: daysAgo(2),
      },
    ],
  });
}

async function printSummary() {
  const [
    users,
    entries,
    approvedEntries,
    toponyms,
    anthroponyms,
    foreignisms,
    neologisms,
    vonalp,
    vonalpEp,
    volna,
    articles,
    events,
    registrations,
    notifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.entry.count(),
    prisma.entry.count({ where: { approvalStatus: ApprovalStatus.APPROVED } }),
    prisma.toponym.count(),
    prisma.anthroponym.count(),
    prisma.foreignism.count(),
    prisma.neologism.count(),
    prisma.vonalpTerm.count({ where: { vocabularyType: 'VONALP', completionStatus: 'COMPLETE' } }),
    prisma.vonalpTerm.count({ where: { vocabularyType: 'VONALP_EP', completionStatus: 'COMPLETE' } }),
    prisma.volnaTerm.count({ where: { approvalStatus: ApprovalStatus.APPROVED } }),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.event.count({ where: { status: 'PUBLISHED' } }),
    prisma.eventRegistration.count(),
    prisma.notification.count(),
  ]);

  console.log('\n══════════════════════════════════════════════════');
  console.log('  SEED DE DEMONSTRAÇÃO — CN-IILP');
  console.log('══════════════════════════════════════════════════\n');
  console.log('Credenciais:');
  console.log('  Admin:      admin@linguistic.com / admin123');
  console.log('  Supervisor: supervisor@linguistic.com / demo123');
  console.log('  Operador 1: operator@linguistic.com / operator123');
  console.log('  Operador 2: operator2@linguistic.com / demo123\n');
  console.log('Conteúdo criado:');
  console.log(`  Utilizadores:        ${users}`);
  console.log(`  Verbetes:            ${entries} (${approvedEntries} aprovados)`);
  console.log(`  Topónimos:           ${toponyms}`);
  console.log(`  Antropónimos:        ${anthroponyms}`);
  console.log(`  Estrangeirismos:     ${foreignisms}`);
  console.log(`  Neologismos:         ${neologisms}`);
  console.log(`  VONALP (completos):  ${vonalp}`);
  console.log(`  VONALP-EP:           ${vonalpEp}`);
  console.log(`  VOLNA (aprovados):   ${volna}`);
  console.log(`  Artigos publicados:  ${articles}`);
  console.log(`  Eventos publicados:  ${events}`);
  console.log(`  Inscrições:          ${registrations}`);
  console.log(`  Notificações:        ${notifications}`);
  console.log('\nPara forçar re-seed: FORCE_DEMO_SEED=true npx prisma db seed');
  console.log('══════════════════════════════════════════════════\n');
}

async function main() {
  const runDemo = await shouldSeedDemo();

  if (!runDemo) {
    console.log('Base de dados já contém dados de demonstração. A actualizar utilizadores...');
    await seedUsers();
    console.log('Seed ignorado. Use FORCE_DEMO_SEED=true para repovoar.');
    return;
  }

  if (process.env.FORCE_DEMO_SEED === 'true') {
    await clearDemoContent();
  }

  console.log('A popular base de dados com conteúdo de demonstração...\n');

  const userIds = await seedUsers();
  const entries = await seedEntries(userIds);
  const toponyms = await seedToponyms(userIds);
  const anthroponyms = await seedAnthroponyms(userIds);
  const foreignisms = await seedForeignisms(userIds);

  await seedNeologisms(userIds);
  await seedVolnaTerms(userIds);
  await seedVonalpTerms(userIds, entries, toponyms, anthroponyms, foreignisms);
  await seedBlogPosts(userIds);
  await seedEvents(userIds);
  await seedNotifications(userIds);
  await seedAuditLogs(userIds);
  await seedReports(userIds);

  await printSummary();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
