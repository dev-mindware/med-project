import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ApprovalStatus,
  EventStatus,
  PostStatus,
  Prisma,
  RegistrationStatus,
  VonalpCompletionStatus,
  VonalpVocabularyType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PublicContentFilterDto, PublicEventPeriod } from './dto/public-content-filter.dto';
import { PublicEventRegistrationDto } from './dto/public-event-registration.dto';
import { VonalpService } from '../vonalp/vonalp.service';
import { VolnaService } from '../volna/volna.service';

const entrySelect = {
  id: true,
  entry: true,
  pronunciation: true,
  syllabicDivision: true,
  etymology: true,
  firstDefinition: true,
  secondDefinition: true,
  thirdDefinition: true,
  usageExample: true,
  abbreviation: true,
  acronym: true,
  acronymMeaning: true,
  reduction: true,
  reductionMeaning: true,
  shortForm: true,
  fullForm: true,
  grammaticalCategory: true,
  grammaticalSubcategory: true,
  grammaticalStatus: true,
  languageCode: true,
  audioUrl: true,
  imageUrl: true,
  videoUrl: true,
  isVocabulary: true,
  isVocabularyEP: true,
  isForeignism: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EntrySelect;

const neologismSelect = {
  id: true,
  entry: true,
  pronunciation: true,
  syllabicDivision: true,
  etymology: true,
  firstDefinition: true,
  secondDefinition: true,
  thirdDefinition: true,
  usageExample: true,
  abbreviation: true,
  acronym: true,
  acronymMeaning: true,
  reduction: true,
  reductionMeaning: true,
  shortForm: true,
  fullForm: true,
  grammaticalCategory: true,
  grammaticalSubcategory: true,
  grammaticalStatus: true,
  languageCode: true,
  audioUrl: true,
  imageUrl: true,
  videoUrl: true,
  isVocabulary: true,
  isVocabularyEP: true,
  isForeignism: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.NeologismSelect;

const toponymSelect = {
  id: true,
  toponym: true,
  pronunciation: true,
  meaning: true,
  province: true,
  municipality: true,
  location: true,
  gentilic: true,
  locationImage: true,
  toponymHistory: true,
  toponymProvenance: true,
  commonUsage: true,
  graphicVariation: true,
  toponymClasses: true,
  toponymSubclasses: true,
  status: true,
  languageCode: true,
  isVocabulary: true,
  isVocabularyEP: true,
  isForeignism: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ToponymSelect;

const anthroponymSelect = {
  id: true,
  name: true,
  gender: true,
  etymology: true,
  meaning: true,
  surname: true,
  surnameMeaning: true,
  historicalFigure: true,
  historicalFigurePseudonym: true,
  historicalFigureDomain: true,
  isVocabulary: true,
  isVocabularyEP: true,
  isForeignism: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AnthroponymSelect;

const foreignismSelect = {
  id: true,
  term: true,
  pronunciation: true,
  originalLanguage: true,
  originCountry: true,
  adaptedForm: true,
  originalForm: true,
  meaning: true,
  definition: true,
  usageExample: true,
  context: true,
  field: true,
  abbreviation: true,
  acronym: true,
  reduction: true,
  shortForm: true,
  fullForm: true,
  grammaticalCategory: true,
  isVocabulary: true,
  isVocabularyEP: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ForeignismSelect;

const eventSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  category: true,
  coverImageUrl: true,
  startDate: true,
  endDate: true,
  location: true,
  registrationCount: true,
  maxRegistrations: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;


type PublicDelegateName =
  | 'entry'
  | 'neologism'
  | 'toponym'
  | 'anthroponym'
  | 'foreignism'
  | 'event'
  | 'blogPost';

type PublicWhereInput = {
  entry: Prisma.EntryWhereInput;
  neologism: Prisma.NeologismWhereInput;
  toponym: Prisma.ToponymWhereInput;
  anthroponym: Prisma.AnthroponymWhereInput;
  foreignism: Prisma.ForeignismWhereInput;
  event: Prisma.EventWhereInput;
  blogPost: Prisma.BlogPostWhereInput;
};

type PublicSelectInput = {
  entry: Prisma.EntrySelect;
  neologism: Prisma.NeologismSelect;
  toponym: Prisma.ToponymSelect;
  anthroponym: Prisma.AnthroponymSelect;
  foreignism: Prisma.ForeignismSelect;
  event: Prisma.EventSelect;
  blogPost: Prisma.BlogPostSelect;
};

type PublicOrderByInput = {
  entry: Prisma.EntryOrderByWithRelationInput;
  neologism: Prisma.NeologismOrderByWithRelationInput;
  toponym: Prisma.ToponymOrderByWithRelationInput;
  anthroponym: Prisma.AnthroponymOrderByWithRelationInput;
  foreignism: Prisma.ForeignismOrderByWithRelationInput;
  event: Prisma.EventOrderByWithRelationInput;
  blogPost: Prisma.BlogPostOrderByWithRelationInput;
};

const blogPostSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImageUrl: true,
  videoUrl: true,
  galleryImageUrls: true,
  type: true,
  category: true,
  tags: true,
  isFeatured: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, profilePhotoUrl: true } },
} satisfies Prisma.BlogPostSelect;

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vonalpService: VonalpService,
    private readonly volnaService: VolnaService,
  ) {}

  async stats() {
    const now = new Date();

    const [
      dictionaryEntries,
      toponyms,
      anthroponyms,
      publishedArticles,
      publishedEvents,
      upcomingEvents,
      vonalpTerms,
      vonalpEpTerms,
      volnaTerms,
    ] = await Promise.all([
      this.prisma.entry.count({ where: { approvalStatus: ApprovalStatus.APPROVED } }),
      this.prisma.toponym.count({ where: { approvalStatus: ApprovalStatus.APPROVED } }),
      this.prisma.anthroponym.count({ where: { approvalStatus: ApprovalStatus.APPROVED } }),
      this.prisma.blogPost.count({ where: { status: PostStatus.PUBLISHED } }),
      this.prisma.event.count({ where: { status: EventStatus.PUBLISHED } }),
      this.prisma.event.count({ where: { status: EventStatus.PUBLISHED, startDate: { gt: now } } }),
      this.prisma.vonalpTerm.count({
        where: {
          vocabularyType: VonalpVocabularyType.VONALP,
          completionStatus: VonalpCompletionStatus.COMPLETE,
        },
      }),
      this.prisma.vonalpTerm.count({
        where: {
          vocabularyType: VonalpVocabularyType.VONALP_EP,
          completionStatus: VonalpCompletionStatus.COMPLETE,
        },
      }),
      this.prisma.volnaTerm.count({ where: { approvalStatus: ApprovalStatus.APPROVED } }),
    ]);

    return {
      dictionaryEntries,
      toponyms,
      anthroponyms,
      publishedArticles,
      publishedEvents,
      upcomingEvents,
      vonalpTerms,
      vonalpEpTerms,
      volnaTerms,
      lexicalTotal: dictionaryEntries + toponyms + anthroponyms + vonalpTerms + vonalpEpTerms + volnaTerms,
      updatedAt: new Date().toISOString(),
    };
  }

  async search(filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters);
    if (!query) {
      return { query: '', entries: [], neologisms: [], toponyms: [], anthroponyms: [], foreignisms: [] };
    }

    const take = 8;
    const [entries, neologisms, toponyms, anthroponyms, foreignisms] = await Promise.all([
      this.prisma.entry.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, ...this.entrySearchWhere(query) },
        take,
        orderBy: { entry: 'asc' },
        select: entrySelect,
      }),
      this.prisma.neologism.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, ...this.neologismSearchWhere(query) },
        take,
        orderBy: { entry: 'asc' },
        select: neologismSelect,
      }),
      this.prisma.toponym.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, ...this.toponymSearchWhere(query) },
        take,
        orderBy: { toponym: 'asc' },
        select: toponymSelect,
      }),
      this.prisma.anthroponym.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, ...this.anthroponymSearchWhere(query) },
        take,
        orderBy: { name: 'asc' },
        select: anthroponymSelect,
      }),
      this.prisma.foreignism.findMany({
        where: { approvalStatus: ApprovalStatus.APPROVED, ...this.foreignismSearchWhere(query) },
        take,
        orderBy: { term: 'asc' },
        select: foreignismSelect,
      }),
    ]);

    return { query, entries, neologisms, toponyms, anthroponyms, foreignisms };
  }

  async dictionary(filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters);
    const where: Prisma.EntryWhereInput = {
      approvalStatus: ApprovalStatus.APPROVED,
      ...(query ? this.entrySearchWhere(query) : {}),
      ...(this.grammaticalCategory(filters) ? { grammaticalCategory: this.grammaticalCategory(filters) } : {}),
      ...(filters.grammaticalSubcategory ? { grammaticalSubcategory: filters.grammaticalSubcategory } : {}),
      ...(filters.languageCode ? { languageCode: { equals: filters.languageCode, mode: 'insensitive' } } : {}),
    };

    return this.paginate('entry', where, entrySelect, { entry: 'asc' }, filters);
  }

  async dictionaryDetails(id: string) {
    return this.findApprovedOrThrow('entry', { id }, entrySelect, 'Entrada nao encontrada');
  }

  async neologisms(filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters);
    const where: Prisma.NeologismWhereInput = {
      approvalStatus: ApprovalStatus.APPROVED,
      ...(query ? this.neologismSearchWhere(query) : {}),
      ...(this.grammaticalCategory(filters) ? { grammaticalCategory: this.grammaticalCategory(filters) } : {}),
      ...(filters.grammaticalSubcategory ? { grammaticalSubcategory: filters.grammaticalSubcategory } : {}),
      ...(filters.languageCode ? { languageCode: { equals: filters.languageCode, mode: 'insensitive' } } : {}),
    };

    return this.paginate('neologism', where, neologismSelect, { entry: 'asc' }, filters);
  }

  async neologismDetails(id: string) {
    return this.findApprovedOrThrow('neologism', { id }, neologismSelect, 'Neologismo nao encontrado');
  }

  async toponyms(filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters);
    const where: Prisma.ToponymWhereInput = {
      approvalStatus: ApprovalStatus.APPROVED,
      ...(query ? this.toponymSearchWhere(query) : {}),
      ...(filters.province ? { province: { equals: filters.province, mode: 'insensitive' } } : {}),
      ...(filters.municipality ? { municipality: { equals: filters.municipality, mode: 'insensitive' } } : {}),
      ...(filters.languageCode ? { languageCode: { equals: filters.languageCode, mode: 'insensitive' } } : {}),
    };

    return this.paginate('toponym', where, toponymSelect, { toponym: 'asc' }, filters);
  }

  async toponymDetails(id: string) {
    return this.findApprovedOrThrow('toponym', { id }, toponymSelect, 'Toponimo nao encontrado');
  }

  async anthroponyms(filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters);
    const where: Prisma.AnthroponymWhereInput = {
      approvalStatus: ApprovalStatus.APPROVED,
      ...(query ? this.anthroponymSearchWhere(query) : {}),
      ...(filters.gender ? { gender: { equals: filters.gender, mode: 'insensitive' } } : {}),
    };

    return this.paginate('anthroponym', where, anthroponymSelect, { name: 'asc' }, filters);
  }

  async anthroponymDetails(id: string) {
    return this.findApprovedOrThrow('anthroponym', { id }, anthroponymSelect, 'Antroponimo nao encontrado');
  }

  async foreignisms(filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters);
    const where: Prisma.ForeignismWhereInput = {
      approvalStatus: ApprovalStatus.APPROVED,
      ...(query ? this.foreignismSearchWhere(query) : {}),
      ...(this.grammaticalCategory(filters) ? { grammaticalCategory: this.grammaticalCategory(filters) } : {}),
      ...(filters.field ? { field: { equals: filters.field, mode: 'insensitive' } } : {}),
      ...(filters.originalLanguage ? { originalLanguage: { equals: filters.originalLanguage, mode: 'insensitive' } } : {}),
      ...(filters.originCountry ? { originCountry: { equals: filters.originCountry, mode: 'insensitive' } } : {}),
    };

    return this.paginate('foreignism', where, foreignismSelect, { term: 'asc' }, filters);
  }

  async foreignismDetails(id: string) {
    return this.findApprovedOrThrow('foreignism', { id }, foreignismSelect, 'Estrangeirismo nao encontrado');
  }

  async vocabulary(vocabularyType: VonalpVocabularyType, filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters).toLowerCase();
    const allTerms = await this.vonalpService.findPublic(vocabularyType);
    const grammaticalCategory = this.grammaticalCategory(filters);
    const filtered = allTerms.filter((term) => {
      const matchesQuery = query
        ? [
            term.term,
            term.pronunciation,
            term.grammaticalCategory,
            term.grammaticalSubcategory,
            term.syllabicDivision,
            term.etymology,
            term.firstDefinition,
            term.secondDefinition,
            term.origin,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))
        : true;
      const matchesCategory = grammaticalCategory ? term.grammaticalCategory === grammaticalCategory : true;
      const matchesSubcategory = filters.grammaticalSubcategory
        ? term.grammaticalSubcategory === filters.grammaticalSubcategory
        : true;

      return matchesQuery && matchesCategory && matchesSubcategory;
    });

    return this.paginateArray(filtered, filters);
  }

  async volna(filters: PublicContentFilterDto) {
    return this.volnaService.findPublic({
      ...filters,
      search: this.searchTerm(filters),
      language: filters.language || filters.languageCode,
    });
  }

  async events(filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters);
    const now = new Date();
    const where: Prisma.EventWhereInput = {
      status: EventStatus.PUBLISHED,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filters.category ? { category: { equals: filters.category, mode: 'insensitive' } } : {}),
    };

    if (filters.period === PublicEventPeriod.UPCOMING) {
      where.startDate = { gt: now };
    } else if (filters.period === PublicEventPeriod.ONGOING) {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else if (filters.period === PublicEventPeriod.PAST) {
      where.endDate = { lt: now };
    }

    return this.paginate('event', where, eventSelect, { startDate: 'asc' }, filters);
  }

  async eventDetails(idOrSlug: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        status: EventStatus.PUBLISHED,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: eventSelect,
    });

    if (!event) throw new NotFoundException('Evento nao encontrado');
    return event;
  }

  async registerForEvent(eventIdOrSlug: string, dto: PublicEventRegistrationDto) {
    const event = await this.prisma.event.findFirst({
      where: {
        status: EventStatus.PUBLISHED,
        OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }],
      },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) throw new NotFoundException('Evento nao encontrado');

    if (event.maxRegistrations && event._count.registrations >= event.maxRegistrations) {
      throw new BadRequestException('As inscricoes para este evento estao esgotadas');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId: event.id, email: dto.email } },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('Este email ja esta inscrito neste evento');
    }

    const registration = await this.prisma.$transaction(async (tx) => {
      const created = await tx.eventRegistration.create({
        data: {
          ...dto,
          eventId: event.id,
          status: RegistrationStatus.PENDING,
        },
        select: {
          id: true,
          eventId: true,
          name: true,
          email: true,
          phone: true,
          organization: true,
          status: true,
          createdAt: true,
        },
      });

      await tx.event.update({
        where: { id: event.id },
        data: { registrationCount: { increment: 1 } },
      });

      return created;
    });

    return {
      ...registration,
      message: 'Inscricao recebida com sucesso. Aguarde a confirmacao da equipa.',
    };
  }

  async blogPosts(filters: PublicContentFilterDto) {
    const query = this.searchTerm(filters);
    const where: Prisma.BlogPostWhereInput = {
      status: PostStatus.PUBLISHED,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { excerpt: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
              { tags: { has: query } },
            ],
          }
        : {}),
      ...(filters.category ? { category: { equals: filters.category, mode: 'insensitive' } } : {}),
    };

    return this.paginate('blogPost', where, blogPostSelect, { publishedAt: 'desc' }, filters);
  }

  async blogPostDetails(idOrSlug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        status: PostStatus.PUBLISHED,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: blogPostSelect,
    });

    if (!post) throw new NotFoundException('Publicacao nao encontrada');
    return post;
  }

  private async paginate<DelegateName extends PublicDelegateName>(
    delegateName: DelegateName,
    where: PublicWhereInput[DelegateName],
    select: PublicSelectInput[DelegateName],
    orderBy: PublicOrderByInput[DelegateName],
    filters: PublicContentFilterDto,
  ) {
    const { page, limit, skip } = this.pagination(filters);
    const delegate = this.prisma[delegateName];

    const [data, total] = await Promise.all([
      delegate.findMany({ where, select, orderBy, skip, take: limit }),
      delegate.count({ where }),
    ]);

    return {
      data,
      meta: this.meta(total, page, limit),
    };
  }

  private paginateArray<T>(items: T[], filters: PublicContentFilterDto) {
    const { page, limit, skip } = this.pagination(filters);
    const data = items.slice(skip, skip + limit);
    return { data, meta: this.meta(items.length, page, limit) };
  }

  private async findApprovedOrThrow<DelegateName extends Exclude<PublicDelegateName, 'event' | 'blogPost'>>(
    delegateName: DelegateName,
    where: PublicWhereInput[DelegateName],
    select: PublicSelectInput[DelegateName],
    message: string,
  ) {
    const delegate = this.prisma[delegateName];
    const item = await delegate.findFirst({
      where: { ...where, approvalStatus: ApprovalStatus.APPROVED },
      select,
    });

    if (!item) throw new NotFoundException(message);
    return item;
  }

  private pagination(filters: PublicContentFilterDto) {
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)));
    return { page, limit, skip: (page - 1) * limit };
  }

  private meta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }

  private searchTerm(filters: PublicContentFilterDto) {
    return (filters.q || filters.search || '').trim();
  }

  private grammaticalCategory(filters: PublicContentFilterDto) {
    return filters.grammaticalCategory || filters.category;
  }

  private entrySearchWhere(query: string): Prisma.EntryWhereInput {
    return {
      OR: [
        { entry: { contains: query, mode: 'insensitive' } },
        { firstDefinition: { contains: query, mode: 'insensitive' } },
        { secondDefinition: { contains: query, mode: 'insensitive' } },
        { thirdDefinition: { contains: query, mode: 'insensitive' } },
        { etymology: { contains: query, mode: 'insensitive' } },
        { usageExample: { contains: query, mode: 'insensitive' } },
      ],
    };
  }

  private neologismSearchWhere(query: string): Prisma.NeologismWhereInput {
    return {
      OR: [
        { entry: { contains: query, mode: 'insensitive' } },
        { firstDefinition: { contains: query, mode: 'insensitive' } },
        { secondDefinition: { contains: query, mode: 'insensitive' } },
        { thirdDefinition: { contains: query, mode: 'insensitive' } },
        { etymology: { contains: query, mode: 'insensitive' } },
        { usageExample: { contains: query, mode: 'insensitive' } },
      ],
    };
  }

  private toponymSearchWhere(query: string): Prisma.ToponymWhereInput {
    return {
      OR: [
        { toponym: { contains: query, mode: 'insensitive' } },
        { meaning: { contains: query, mode: 'insensitive' } },
        { province: { contains: query, mode: 'insensitive' } },
        { municipality: { contains: query, mode: 'insensitive' } },
        { gentilic: { contains: query, mode: 'insensitive' } },
        { toponymHistory: { contains: query, mode: 'insensitive' } },
      ],
    };
  }

  private anthroponymSearchWhere(query: string): Prisma.AnthroponymWhereInput {
    return {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { surname: { contains: query, mode: 'insensitive' } },
        { meaning: { contains: query, mode: 'insensitive' } },
        { etymology: { contains: query, mode: 'insensitive' } },
        { historicalFigure: { contains: query, mode: 'insensitive' } },
      ],
    };
  }

  private foreignismSearchWhere(query: string): Prisma.ForeignismWhereInput {
    return {
      OR: [
        { term: { contains: query, mode: 'insensitive' } },
        { meaning: { contains: query, mode: 'insensitive' } },
        { definition: { contains: query, mode: 'insensitive' } },
        { originalLanguage: { contains: query, mode: 'insensitive' } },
        { originCountry: { contains: query, mode: 'insensitive' } },
        { field: { contains: query, mode: 'insensitive' } },
      ],
    };
  }
}
