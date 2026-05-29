import { VocabularyProcessorService } from './vocabulary-processor.service';

describe('VocabularyProcessorService', () => {
  let service: VocabularyProcessorService;

  beforeEach(() => {
    service = new VocabularyProcessorService();
  });

  it('separates terms by source model and deduplicates per model', () => {
    const result = service.process([
      { sourceModel: 'ENTRY', data: { entry: 'Casa', firstDefinition: 'Habitacao' } },
      { sourceModel: 'ENTRY', data: { entry: ' casa ', firstDefinition: 'Duplicada' } },
      { sourceModel: 'TOPONYM', data: { toponym: 'Casa', province: 'Luanda' } },
      { sourceModel: 'ANTHROPONYM', data: { name: 'Kiala', meaning: 'Nome proprio' } },
      { sourceModel: 'FOREIGNISM', data: { term: 'online', definition: 'Ligado a internet' } },
    ]);

    expect(result.entries).toHaveLength(1);
    expect(result.toponyms).toHaveLength(1);
    expect(result.anthroponyms).toHaveLength(1);
    expect(result.foreignisms).toHaveLength(1);
    expect(result.stats.duplicatesRemoved).toBe(1);
  });

  it('adds warnings for missing required fields', () => {
    const result = service.process([
      { sourceModel: 'TOPONYM', data: { toponym: 'Maianga' } },
    ]);

    expect(result.toponyms).toHaveLength(1);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceModel: 'TOPONYM',
          field: 'province',
          message: 'Campo obrigatorio ausente',
        }),
      ]),
    );
  });
});
