import { VocabularyProcessorService } from './vocabulary-processor.service';

describe('VocabularyProcessorService', () => {
  let service: VocabularyProcessorService;

  beforeEach(() => {
    service = new VocabularyProcessorService();
  });

  // ─── Separação por modelo e deduplicação ───────────────────────────────

  it('separa termos por sourceModel e deduplica por modelo', () => {
    const result = service.process([
      {
        sourceModel: 'ENTRY',
        confidence: 0.9,
        data: { entry: 'Casa', firstDefinition: 'Habitação' },
      },
      {
        sourceModel: 'ENTRY',
        confidence: 0.9,
        data: { entry: ' casa ', firstDefinition: 'Duplicada' },
      },
      {
        sourceModel: 'TOPONYM',
        confidence: 0.85,
        data: { toponym: 'Casa', province: 'Luanda' },
      },
      {
        sourceModel: 'ANTHROPONYM',
        confidence: 0.9,
        data: { name: 'Kiala', meaning: 'Nome próprio' },
      },
      {
        sourceModel: 'FOREIGNISM',
        confidence: 0.9,
        data: { term: 'online', definition: 'Ligado à internet' },
      },
    ]);

    expect(result.entries).toHaveLength(1);
    expect(result.toponyms).toHaveLength(1);
    expect(result.anthroponyms).toHaveLength(1);
    expect(result.foreignisms).toHaveLength(1);
    expect(result.stats.duplicatesRemoved).toBe(1);
  });

  it('gera avisos para campos obrigatórios em falta', () => {
    const result = service.process([
      { sourceModel: 'TOPONYM', confidence: 0.9, data: { toponym: 'Maianga' } },
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

  // ─── Validação de tokens lexicais (AO45) ──────────────────────────────

  describe('isValidTerm — tokens lexicais (hífens não separam tokens)', () => {
    const cases: [string, boolean, string][] = [
      ['casa', true, 'palavra simples'],
      ['couve-flor', true, 'composto hifenizado = 1 token'],
      ['bem-te-vi', true, 'espécie zoológica = 1 token'],
      ['joão-de-barro', true, 'composto com preposição = 1 token'],
      ['pré-natal', true, 'prefixado = 1 token'],
      ['fim de semana', true, 'locução nominal = 3 tokens'],
      ['de repente', true, 'locução adverbial = 2 tokens'],
      [
        'segunda-feira de manhã',
        true,
        'composto + espaço = 2 tokens (couve-flor + de manhã → rejeitado se > 3)',
      ],
      [
        'segunda-feira de manhã cedo',
        false,
        'composto + 3 palavras = 4 tokens (inválido)',
      ],
      ['', false, 'vazio'],
      ['   ', false, 'só espaços'],
    ];

    cases.forEach(([term, expected, label]) => {
      it(`"${term}" → ${expected ? 'aceite' : 'rejeitado'} (${label})`, () => {
        // Acede ao método privado através de type cast
        const result = (service as any).isValidTerm('ENTRY', term);
        expect(result).toBe(expected);
      });
    });
  });

  // ─── Deduplicação normalizada (ignora hífens e acentos) ───────────────

  describe('normalizeForDedup — hífens e espaços ignorados', () => {
    const dedupCases: [string, string, boolean, string][] = [
      ['Couve-flor', 'couve-flor', true, 'maiúscula vs minúscula com hífen'],
      ['couve flor', 'couve-flor', true, 'espaço vs hífen'],
      ['COUVEFLOR', 'couve-flor', true, 'aglutinado vs hifenizado'],
      ['musseque', 'Musseque', true, 'diferença de capitalização'],
      ['erva-doce', 'erva doce', true, 'hífen vs espaço na espécie botânica'],
      ['casa', 'casas', false, 'formas diferentes'],
      ['couve', 'couve-flor', false, 'raiz vs composto'],
    ];

    dedupCases.forEach(([a, b, shouldMatch, label]) => {
      it(`"${a}" e "${b}" ${shouldMatch ? 'são iguais' : 'são diferentes'} — ${label}`, () => {
        const normA = (service as any).normalizeForDedup(a);
        const normB = (service as any).normalizeForDedup(b);
        // Verificamos que as formas normalizadas são (ou não) iguais entre si
        if (shouldMatch) {
          expect(normA).toBe(normB);
        } else {
          expect(normA).not.toBe(normB);
        }
      });
    });
  });

  // ─── Defaults por modelo ───────────────────────────────────────────────

  it('aplica wordType="simples" como default para ENTRY', () => {
    const result = service.process([
      {
        sourceModel: 'ENTRY',
        confidence: 0.9,
        data: { entry: 'casa', firstDefinition: 'Habitação' },
      },
    ]);
    expect(result.entries[0]).toMatchObject({ wordType: 'simples' });
  });

  it('aplica wordType passado pela IA sem o sobrescrever', () => {
    const result = service.process([
      {
        sourceModel: 'ENTRY',
        confidence: 0.95,
        data: {
          entry: 'couve-flor',
          firstDefinition: 'Planta',
          wordType: 'especie-botanica',
        },
      },
    ]);
    expect(result.entries[0]).toMatchObject({ wordType: 'especie-botanica' });
  });

  it('aplica toponymClasses=[] e toponymSubclasses=[] como defaults para TOPONYM', () => {
    const result = service.process([
      {
        sourceModel: 'TOPONYM',
        confidence: 0.9,
        data: { toponym: 'Luanda', province: 'Luanda' },
      },
    ]);
    expect(result.toponyms[0]).toMatchObject({
      toponymClasses: [],
      toponymSubclasses: [],
    });
  });

  it('aplica integrationLevel="nao-adaptado" como default para FOREIGNISM', () => {
    const result = service.process([
      {
        sourceModel: 'FOREIGNISM',
        confidence: 0.9,
        data: { term: 'software', definition: 'Programa' },
      },
    ]);
    expect(result.foreignisms[0]).toMatchObject({
      integrationLevel: 'nao-adaptado',
    });
  });

  // ─── Stats ────────────────────────────────────────────────────────────

  it('calcula stats correctamente incluindo lowConfidenceDiscarded=0', () => {
    const result = service.process([
      {
        sourceModel: 'ENTRY',
        confidence: 0.9,
        data: { entry: 'casa', firstDefinition: 'Habitação' },
      },
      {
        sourceModel: 'TOPONYM',
        confidence: 0.9,
        data: { toponym: 'Luanda', province: 'Luanda' },
      },
    ]);
    expect(result.stats).toMatchObject({
      totalTerms: 2,
      validRows: 2,
      entries: 1,
      toponyms: 1,
      duplicatesRemoved: 0,
      lowConfidenceDiscarded: 0,
    });
  });

  // ─── Bantuísmos / Angolanismos ─────────────────────────────────────────

  it('aceita bantuísmo com languageCode="kimbundu"', () => {
    const result = service.process([
      {
        sourceModel: 'ENTRY',
        confidence: 0.97,
        data: {
          entry: 'musseque',
          wordType: 'bantuismo',
          firstDefinition: 'Bairro periférico.',
          languageCode: 'kimbundu',
          isVocabulary: true,
        },
      },
    ]);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      entry: 'musseque',
      wordType: 'bantuismo',
      languageCode: 'kimbundu',
      isVocabulary: true,
    });
  });
});
