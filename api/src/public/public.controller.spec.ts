import { Test, TestingModule } from '@nestjs/testing';
import { VonalpVocabularyType } from '@prisma/client';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

describe('PublicController', () => {
  let controller: PublicController;
  let publicService: jest.Mocked<Partial<PublicService>>;

  beforeEach(async () => {
    publicService = {
      stats: jest
        .fn()
        .mockResolvedValue({ dictionaryEntries: 0, lexicalTotal: 0 }),
      search: jest.fn().mockResolvedValue({ query: 'casa', entries: [] }),
      dictionary: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
      dictionaryDetails: jest.fn().mockResolvedValue({ id: 'entry-1' }),
      toponyms: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
      toponymDetails: jest.fn().mockResolvedValue({ id: 'toponym-1' }),
      anthroponyms: jest
        .fn()
        .mockResolvedValue({ data: [], meta: { total: 0 } }),
      anthroponymDetails: jest.fn().mockResolvedValue({ id: 'anthroponym-1' }),
      foreignisms: jest
        .fn()
        .mockResolvedValue({ data: [], meta: { total: 0 } }),
      foreignismDetails: jest.fn().mockResolvedValue({ id: 'foreignism-1' }),
      vocabulary: jest.fn().mockResolvedValue({
        data: [{ id: 'vt-1', term: 'Casa' }],
        meta: { total: 1 },
      }),
      events: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
      eventDetails: jest.fn().mockResolvedValue({ id: 'event-1' }),
      registerForEvent: jest.fn().mockResolvedValue({ id: 'registration-1' }),
      blogPosts: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
      blogPostDetails: jest.fn().mockResolvedValue({ id: 'post-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [{ provide: PublicService, useValue: publicService }],
    }).compile();

    controller = module.get<PublicController>(PublicController);
  });

  it('delegates global search to PublicService', async () => {
    const filters = { q: 'casa' };
    await controller.globalSearch(filters);
    expect(publicService.search).toHaveBeenCalledWith(filters);
  });

  it('returns public stats from PublicService', async () => {
    await controller.publicStats();
    expect(publicService.stats).toHaveBeenCalled();
  });

  it('lists public VONALP terms', async () => {
    const filters = { page: 1, limit: 10 };
    const result = await controller.publicVonalp(filters);

    expect(result.data).toHaveLength(1);
    expect(publicService.vocabulary).toHaveBeenCalledWith(
      VonalpVocabularyType.VONALP,
      filters,
    );
  });

  it('lists public VONALP-EP terms', async () => {
    const filters = { page: 1, limit: 10 };
    await controller.publicVonalpEp(filters);

    expect(publicService.vocabulary).toHaveBeenCalledWith(
      VonalpVocabularyType.VONALP_EP,
      filters,
    );
  });

  it('registers a public user for an event', async () => {
    const body = { name: 'Jonatao Cardoso', email: 'jonatao@example.com' };
    await controller.registerForEvent('evento-x', body);

    expect(publicService.registerForEvent).toHaveBeenCalledWith(
      'evento-x',
      body,
    );
  });
});
