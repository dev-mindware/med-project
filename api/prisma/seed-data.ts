/**
 * Dados de demonstração para apresentação da plataforma CN-IILP.
 * Vocabulário, toponímia, antroponímia e conteúdos institucionais em contexto angolano.
 */

import {
  ApprovalStatus,
  EventStatus,
  PostStatus,
  PostType,
  RegistrationStatus,
  UserRole,
  VonalpCompletionStatus,
  VonalpSourceType,
  VonalpVocabularyType,
} from '@prisma/client';

export const DEMO_PASSWORD = 'demo123';

export const demoUsers = [
  {
    email: 'admin@linguistic.com',
    name: 'Maria da Conceição',
    role: UserRole.ADMIN,
    password: 'admin123',
  },
  {
    email: 'supervisor@linguistic.com',
    name: 'Paulo Mukenga',
    role: UserRole.SUPERVISOR,
    password: DEMO_PASSWORD,
  },
  {
    email: 'operator@linguistic.com',
    name: 'Ana Catarina',
    role: UserRole.OPERATOR,
    password: 'operator123',
    supervisorEmail: 'supervisor@linguistic.com',
  },
  {
    email: 'operator2@linguistic.com',
    name: 'João Kiluanje',
    role: UserRole.OPERATOR,
    password: DEMO_PASSWORD,
    supervisorEmail: 'supervisor@linguistic.com',
  },
] as const;

type EntrySeed = {
  entry: string;
  pronunciation?: string;
  syllabicDivision?: string;
  etymology?: string;
  firstDefinition: string;
  secondDefinition?: string;
  thirdDefinition?: string;
  usageExample?: string;
  grammaticalCategory?: string;
  grammaticalSubcategory?: string;
  grammaticalStatus?: string;
  languageCode?: string;
  approvalStatus: ApprovalStatus;
  isVocabulary?: boolean;
  isVocabularyEP?: boolean;
  creatorEmail: string;
  approverEmail?: string;
  rejectionReason?: string;
  correctionNotes?: string;
  vonalp?: boolean;
  vonalpEp?: boolean;
};

export const demoEntries: EntrySeed[] = [
  {
    entry: 'Abcedário',
    pronunciation: '/ɐbsɨdɨˈaɾiu/',
    syllabicDivision: 'Ab-ce-dá-rio',
    etymology: 'Do latim abecedārium, de abecēdārius.',
    firstDefinition: 'Conjunto das letras de uma língua dispostas por uma ordem convencionada.',
    secondDefinition: 'Livro elementar para aprender a ler e a escrever.',
    usageExample: 'O professor distribuiu o abcedário ilustrado à turma do primeiro ano.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'common_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    isVocabularyEP: true,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
    vonalpEp: true,
  },
  {
    entry: 'Kizua',
    pronunciation: '/kiˈzuɐ/',
    syllabicDivision: 'Ki-zu-a',
    etymology: 'Termo de origem kimbundu, incorporado ao português angolano.',
    firstDefinition: 'Saudação informal usada entre jovens em Luanda.',
    usageExample: 'Kizua, mana! Como é que a família está?',
    grammaticalCategory: 'interjection',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Musseque',
    pronunciation: '/muˈsɛkɨ/',
    syllabicDivision: 'Mus-se-que',
    etymology: 'Do kimbundu muxiku, designando zona de habitação espontânea.',
    firstDefinition: 'Bairro de habitação popular, geralmente de construção informal.',
    secondDefinition: 'Comunidade urbana com forte identidade cultural e social.',
    usageExample: 'Cresci num musseque nos arredores de Viana.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'common_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    isVocabularyEP: true,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
    vonalpEp: true,
  },
  {
    entry: 'Ginguba',
    pronunciation: '/ʒĩˈgubɐ/',
    syllabicDivision: 'Gin-gu-ba',
    etymology: 'Do umbundu, termo amplamente usado em Angola.',
    firstDefinition: 'Amendoim; semente oleaginosa muito consumida em Angola.',
    usageExample: 'Vendi ginguba torrada no mercado da Maianga.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'concrete_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    isVocabularyEP: true,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
    vonalpEp: true,
  },
  {
    entry: 'Candongueiro',
    pronunciation: '/kɐ̃duŋˈgejɾu/',
    syllabicDivision: 'Can-don-guei-ro',
    etymology: 'De candongo, veículo de transporte coletivo informal.',
    firstDefinition: 'Condutor de candongueiro; operador de transporte urbano informal.',
    usageExample: 'O candongueiro conhece todos os atalhos de Luanda.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'common_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'admin@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Semba',
    pronunciation: '/ˈsẽbɐ/',
    syllabicDivision: 'Sem-ba',
    etymology: 'Do kimbundu semba, dança e género musical angolano.',
    firstDefinition: 'Género musical e dança tradicional de Angola, origem do kizomba.',
    usageExample: 'Na festa, todos dançaram semba até ao amanhecer.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'abstract_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    isVocabularyEP: true,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
    vonalpEp: true,
  },
  {
    entry: 'Kizomba',
    pronunciation: '/kiˈzõbɐ/',
    syllabicDivision: 'Ki-zom-ba',
    etymology: 'Do kimbundu kizomba, «festa» ou «celebração».',
    firstDefinition: 'Género musical e dança de salão originário de Angola.',
    usageExample: 'A kizomba conquistou salas de baile em todo o mundo lusófono.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'abstract_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Mufete',
    pronunciation: '/muˈfɛtɨ/',
    syllabicDivision: 'Mu-fe-te',
    etymology: 'Prato tradicional da gastronomia angolana.',
    firstDefinition: 'Prato típico angolano à base de peixe grelhado, feijão, banana e farinha.',
    usageExample: 'No domingo, a família reuniu-se para um mufete na ilha.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'concrete_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    isVocabularyEP: true,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
    vonalpEp: true,
  },
  {
    entry: 'Pirão',
    pronunciation: '/piˈɾɐ̃w/',
    syllabicDivision: 'Pi-rão',
    etymology: 'Do português, adaptado à culinária angolana.',
    firstDefinition: 'Massa espessa preparada com farinha de mandioca ou de milho.',
    usageExample: 'O pirão acompanha o calulu de peixe.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'concrete_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    isVocabularyEP: true,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
    vonalpEp: true,
  },
  {
    entry: 'Calulu',
    pronunciation: '/kɐˈlulu/',
    syllabicDivision: 'Ca-lu-lu',
    etymology: 'Prato de influência africana, comum em Angola e São Tomé.',
    firstDefinition: 'Guisado tradicional à base de folhas, peixe ou carne seca.',
    usageExample: 'O calulu de peixe é prato obrigatório nas festas de família.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'concrete_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Kandengue',
    pronunciation: '/kɐ̃ˈdẽgɨ/',
    syllabicDivision: 'Kan-den-gue',
    etymology: 'Gíria urbana de Luanda.',
    firstDefinition: 'Jovem das periferias urbanas; termo com conotações identitárias.',
    usageExample: 'Os kandengues criaram uma cultura visual própria na cidade.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'common_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Soba',
    pronunciation: '/ˈsɔbɐ/',
    syllabicDivision: 'So-ba',
    etymology: 'Do kimbundu soba, chefe tradicional.',
    firstDefinition: 'Chefe tradicional; autoridade comunitária em comunidades rurais.',
    usageExample: 'O soba presidiu a reunião do conselho de anciãos.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'proper_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    isVocabularyEP: true,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'admin@linguistic.com',
    vonalp: true,
    vonalpEp: true,
  },
  {
    entry: 'Makila',
    pronunciation: '/mɐˈkilɐ/',
    syllabicDivision: 'Ma-ki-la',
    etymology: 'Do kikongo makila, bastão tradicional.',
    firstDefinition: 'Bastão de madeira entalhada, símbolo de autoridade e arte tradicional.',
    usageExample: 'O makila foi oferecido como presente diplomático.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'concrete_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Tchokwe',
    pronunciation: '/ˈtʃɔkwɨ/',
    syllabicDivision: 'Tcho-kwe',
    etymology: 'Nome de um povo e língua nacional de Angola.',
    firstDefinition: 'Relativo ao povo Tchokwe, predominante no Leste angolano.',
    secondDefinition: 'Língua nacional falada nas províncias de Lunda e Moxico.',
    grammaticalCategory: 'adjective',
    grammaticalSubcategory: 'qualifying_adjective',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Lusofonia',
    pronunciation: '/luzufuˈniɐ/',
    syllabicDivision: 'Lu-so-fo-nia',
    etymology: 'De lusófono + -ia.',
    firstDefinition: 'Conjunto de povos e culturas que falam língua portuguesa.',
    usageExample: 'Angola é um pilar da lusofonia no continente africano.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'abstract_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-PT',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Quilombismo',
    pronunciation: '/kilõˈbizmu/',
    syllabicDivision: 'Qui-lom-bis-mo',
    etymology: 'De quilombo + -ismo.',
    firstDefinition: 'Ideologia de resistência e autonomia comunitária de matriz africana.',
    usageExample: 'O quilombismo inspira movimentos culturais contemporâneos.',
    grammaticalCategory: 'noun',
    grammaticalSubcategory: 'abstract_noun',
    grammaticalStatus: 'valid',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.APPROVED,
    isVocabulary: true,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    vonalp: true,
  },
  {
    entry: 'Pendente de revisão',
    pronunciation: '/pẽˈdẽtɨ dɨ ʁɨviˈzɐ̃w/',
    syllabicDivision: 'Pen-den-te de re-vi-são',
    firstDefinition: 'Entrada em processo de validação pelo supervisor.',
    grammaticalCategory: 'noun',
    grammaticalStatus: 'pending',
    languageCode: 'pt-AO',
    approvalStatus: ApprovalStatus.PENDING_APPROVAL,
    creatorEmail: 'operator@linguistic.com',
  },
  {
    entry: 'Rascunho lexical',
    firstDefinition: 'Entrada ainda em elaboração pelo operador.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.DRAFT,
    creatorEmail: 'operator2@linguistic.com',
  },
  {
    entry: 'Termo rejeitado',
    firstDefinition: 'Exemplo de entrada rejeitada na revisão.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.REJECTED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    rejectionReason: 'Definição insuficiente e falta de fontes lexicográficas.',
  },
  {
    entry: 'Correção solicitada',
    firstDefinition: 'Entrada que necessita de ajustes antes de aprovação.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.NEEDS_CORRECTION,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    correctionNotes: 'Incluir exemplo de uso e referência etimológica.',
  },
];

type ToponymSeed = {
  toponym: string;
  pronunciation?: string;
  meaning?: string;
  province: string;
  municipality?: string;
  location?: string;
  gentilic?: string;
  toponymHistory?: string;
  toponymProvenance?: string;
  commonUsage?: string;
  toponymClasses: string[];
  toponymSubclasses: string[];
  status?: string;
  approvalStatus: ApprovalStatus;
  creatorEmail: string;
  approverEmail?: string;
  isVocabulary?: boolean;
  isVocabularyEP?: boolean;
  vonalp?: boolean;
};

export const demoToponyms: ToponymSeed[] = [
  {
    toponym: 'Luanda',
    pronunciation: '/luˈɐ̃dɐ/',
    meaning: 'Capital de Angola e principal centro urbano do país.',
    province: 'luanda',
    municipality: 'luanda',
    gentilic: 'luandense',
    toponymHistory: 'Fundada em 1576 como São Paulo de Loanda.',
    toponymProvenance: 'Nome de origem local atribuído à baía onde a cidade se implantou.',
    commonUsage: 'official',
    toponymClasses: ['settlements', 'administration'],
    toponymSubclasses: ['city', 'province'],
    status: 'valid',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Benguela',
    meaning: 'Cidade costeira e capital da província homónima.',
    province: 'benguela',
    municipality: 'benguela',
    gentilic: 'benguelense',
    toponymHistory: 'Importante porto durante o período colonial.',
    toponymClasses: ['settlements'],
    toponymSubclasses: ['city'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Huambo',
    meaning: 'Capital da província do Huambo, antiga Nova Lisboa.',
    province: 'huambo',
    municipality: 'huambo',
    gentilic: 'huambano',
    toponymClasses: ['settlements', 'administration'],
    toponymSubclasses: ['city', 'province'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Lubango',
    meaning: 'Segunda maior cidade do sul de Angola.',
    province: 'huila',
    municipality: 'lubango',
    gentilic: 'lubanguense',
    toponymClasses: ['settlements'],
    toponymSubclasses: ['city'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'admin@linguistic.com',
    isVocabulary: true,
    isVocabularyEP: true,
    vonalp: true,
  },
  {
    toponym: 'Rio Cuanza',
    meaning: 'Principal rio de Angola, atravessa o centro do país.',
    province: 'cuanza_norte',
    location: 'Bacia hidrográfica central',
    toponymClasses: ['hydrography'],
    toponymSubclasses: ['river'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Quedas de Kalandula',
    meaning: 'Uma das maiores quedas de água de África.',
    province: 'malanje',
    municipality: 'calandula',
    toponymHistory: 'Nome homenageia o rei Kalandula do reino do Ndongo.',
    toponymClasses: ['hydrography', 'others'],
    toponymSubclasses: ['waterfall', 'national_park'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Soyo',
    meaning: 'Cidade portuária na foz do Congo, província do Zaire.',
    province: 'zaire',
    municipality: 'soyo',
    gentilic: 'soyense',
    toponymClasses: ['settlements', 'infrastructure'],
    toponymSubclasses: ['city', 'port'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Menongue',
    meaning: 'Capital da província do Cuando Cubango.',
    province: 'cuando_cubango',
    municipality: 'menongue',
    gentilic: 'menonguense',
    toponymClasses: ['settlements'],
    toponymSubclasses: ['city'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Mbanza Kongo',
    meaning: 'Cidade histórica, antiga capital do Reino do Congo.',
    province: 'zaire',
    municipality: 'mbanza_kongo',
    toponymHistory: 'Património Mundial da UNESCO desde 2017.',
    toponymClasses: ['settlements', 'others'],
    toponymSubclasses: ['city', 'national_park'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    isVocabularyEP: true,
    vonalp: true,
  },
  {
    toponym: 'Namibe',
    meaning: 'Capital da província costeira do Namibe, antiga Moçâmedes.',
    province: 'namibe',
    municipality: 'mocamedes',
    gentilic: 'namibense',
    toponymClasses: ['settlements'],
    toponymSubclasses: ['city'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Serra da Leba',
    meaning: 'Serra emblemática com estrada em espiral na Huíla.',
    province: 'huila',
    location: 'Entre Lubango e Namibe',
    toponymClasses: ['orography'],
    toponymSubclasses: ['sierra'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Cabinda',
    meaning: 'Capital da província enclave do Cabinda.',
    province: 'cabinda',
    municipality: 'cabinda',
    gentilic: 'cabindense',
    toponymClasses: ['settlements', 'administration'],
    toponymSubclasses: ['city', 'province'],
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    toponym: 'Topónimo em revisão',
    meaning: 'Exemplo para fluxo de aprovação.',
    province: 'bie',
    toponymClasses: ['others'],
    toponymSubclasses: ['reserve'],
    approvalStatus: ApprovalStatus.PENDING_APPROVAL,
    creatorEmail: 'operator@linguistic.com',
  },
];

type AnthroponymSeed = {
  name: string;
  gender?: string;
  etymology?: string;
  meaning?: string;
  surname?: string;
  historicalFigure?: string;
  historicalFigureDomain?: string;
  approvalStatus: ApprovalStatus;
  creatorEmail: string;
  approverEmail?: string;
  isVocabulary?: boolean;
  vonalp?: boolean;
};

export const demoAnthroponyms: AnthroponymSeed[] = [
  {
    name: 'Nzinga',
    gender: 'female',
    etymology: 'Nome de origem bantu, associado à rainha Ana Nzinga.',
    meaning: 'Aquele que rodeia; nome de figura histórica do Ndongo e Matamba.',
    historicalFigure: 'Ana Nzinga Mbande',
    historicalFigureDomain: 'Política e resistência',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Agostinho',
    gender: 'male',
    etymology: 'Do latim Augustinus.',
    meaning: 'Nome próprio masculino de tradição cristã e lusófona.',
    surname: 'Neto',
    historicalFigure: 'Agostinho Neto',
    historicalFigureDomain: 'Política e literatura',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Kiluanje',
    gender: 'male',
    etymology: 'Nome tradicional de origem kimbundu.',
    meaning: 'Nome próprio masculino comum em comunidades do centro de Angola.',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Welwitschia',
    gender: 'female',
    etymology: 'Homenagem ao botânico austríaco Friedrich Welwitsch.',
    meaning: 'Nome próprio feminino, também designa planta endémica do Namibe.',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'admin@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Mukenga',
    gender: 'male',
    etymology: 'Do kikongo, nome de família tradicional.',
    meaning: 'Nome próprio masculino; também apelido de tradição do norte.',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Cacilda',
    gender: 'female',
    etymology: 'Variante de Casilda, de origem visigótica.',
    meaning: 'Nome próprio feminino popular em Angola.',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Tchissengue',
    gender: 'neutral',
    etymology: 'Nome de origem umbundu.',
    meaning: 'Nome próprio unissex usado no planalto central.',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Nzoji',
    gender: 'female',
    etymology: 'Nome tradicional do povo Tchokwe.',
    meaning: 'Nome próprio feminino associado a linhagens reais tchokwe.',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Domingos',
    gender: 'male',
    etymology: 'Do latim Dominicus, «do Senhor».',
    meaning: 'Nome próprio masculino muito frequente em Angola.',
    surname: 'Capela',
    historicalFigure: 'Domingos Capela',
    historicalFigureDomain: 'Música',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    name: 'Rosa',
    gender: 'female',
    etymology: 'Do latim rosa, a flor.',
    meaning: 'Nome próprio feminino de tradição lusófona.',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
];

type ForeignismSeed = {
  term: string;
  pronunciation?: string;
  originalLanguage?: string;
  originCountry?: string;
  adaptedForm?: string;
  originalForm?: string;
  meaning?: string;
  definition: string;
  usageExample?: string;
  context?: string;
  field?: string;
  grammaticalCategory?: string;
  approvalStatus: ApprovalStatus;
  creatorEmail: string;
  approverEmail?: string;
  isVocabulary?: boolean;
  vonalp?: boolean;
};

export const demoForeignisms: ForeignismSeed[] = [
  {
    term: 'Software',
    pronunciation: '/ˈsɔftwɛɾ/',
    originalLanguage: 'Inglês',
    originCountry: 'Estados Unidos',
    adaptedForm: 'Software',
    originalForm: 'Software',
    definition: 'Conjunto de programas e instruções que fazem funcionar um computador.',
    usageExample: 'Instalámos o software de gestão lexical na CN-IILP.',
    context: 'Informática',
    field: 'Tecnologia',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    term: 'Marketing',
    pronunciation: '/mɐɾkɨˈtiŋ/',
    originalLanguage: 'Inglês',
    originCountry: 'Reino Unido',
    adaptedForm: 'Marketing',
    originalForm: 'Marketing',
    definition: 'Conjunto de técnicas para promover produtos ou serviços.',
    field: 'Economia',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    term: 'Chá',
    pronunciation: '/ˈʃa/',
    originalLanguage: 'Chinês',
    originCountry: 'China',
    adaptedForm: 'Chá',
    originalForm: '茶',
    definition: 'Bebida preparada por infusão de folhas secas da planta Camellia sinensis.',
    usageExample: 'Oferecemos chá de moringa aos visitantes.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    term: 'Bazuca',
    pronunciation: '/bɐˈzukɐ/',
    originalLanguage: 'Inglês',
    originCountry: 'Estados Unidos',
    adaptedForm: 'Bazuca',
    originalForm: 'Bazooka',
    definition: 'Gíria para algo impressionante ou de grande impacto.',
    context: 'Gíria urbana angolana',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'admin@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    term: 'Zungueira',
    pronunciation: '/zũˈgejɾɐ/',
    originalLanguage: 'Kimbundu',
    originCountry: 'Angola',
    adaptedForm: 'Zungueira',
    definition: 'Mulher vendedora ambulante; termo incorporado ao léxico urbano angolano.',
    context: 'Sociedade',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    term: 'Boy',
    pronunciation: '/bɔj/',
    originalLanguage: 'Inglês',
    originCountry: 'Reino Unido',
    adaptedForm: 'Boy',
    originalForm: 'Boy',
    definition: 'Termo usado em contexto urbano para rapaz ou jovem.',
    context: 'Gíria',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
    isVocabulary: true,
    vonalp: true,
  },
  {
    term: 'Estrangeirismo pendente',
    definition: 'Termo aguardando validação.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.PENDING_APPROVAL,
    creatorEmail: 'operator@linguistic.com',
  },
];

type NeologismSeed = {
  entry: string;
  pronunciation?: string;
  etymology?: string;
  firstDefinition: string;
  usageExample?: string;
  grammaticalCategory?: string;
  approvalStatus: ApprovalStatus;
  creatorEmail: string;
  approverEmail?: string;
};

export const demoNeologisms: NeologismSeed[] = [
  {
    entry: 'Influenciador',
    pronunciation: '/ĩfluẽsiɐˈdoɾ/',
    etymology: 'De influência + -dor.',
    firstDefinition: 'Pessoa que exerce influência nas redes sociais sobre comportamentos e consumo.',
    usageExample: 'O influenciador angolano promoveu o português nas redes.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
  },
  {
    entry: 'Podcast',
    pronunciation: '/ˈpɔdkɐst/',
    etymology: 'Do inglês podcast.',
    firstDefinition: 'Programa de áudio digital distribuído por episódios.',
    usageExample: 'Lançámos um podcast sobre línguas nacionais.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
  },
  {
    entry: 'Desinformação',
    pronunciation: '/dɨzĩfuɾmɐˈsɐ̃w/',
    etymology: 'De des- + informação.',
    firstDefinition: 'Divulgação intencional de informação falsa ou enganosa.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator2@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
  },
  {
    entry: 'Criptomoeda',
    pronunciation: '/kɾiptumuˈedɐ/',
    etymology: 'De cripto- + moeda.',
    firstDefinition: 'Moeda digital baseada em criptografia e tecnologia blockchain.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'operator@linguistic.com',
    approverEmail: 'admin@linguistic.com',
  },
  {
    entry: 'Telemedicina',
    pronunciation: '/tɛlɨmɨdiˈsinɐ/',
    etymology: 'De tele- + medicina.',
    firstDefinition: 'Prestação de serviços de saúde à distância por meios digitais.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.APPROVED,
    creatorEmail: 'admin@linguistic.com',
    approverEmail: 'supervisor@linguistic.com',
  },
  {
    entry: 'Neologismo em rascunho',
    firstDefinition: 'Termo novo ainda em elaboração.',
    grammaticalCategory: 'noun',
    approvalStatus: ApprovalStatus.DRAFT,
    creatorEmail: 'operator2@linguistic.com',
  },
];

type VolnaSeed = {
  term: string;
  language: string;
  grammaticalCategory?: string;
  grammaticalSubcategory?: string;
  definition: string;
  usageExample?: string;
  notes?: string;
  approvalStatus: ApprovalStatus;
  creatorEmail: string;
  approverEmail?: string;
};

export const demoVolnaTerms: VolnaSeed[] = [
  { term: 'Nzambi', language: 'Kikongo', grammaticalCategory: 'noun', definition: 'Deus; criador supremo na cosmologia kikongo.', usageExample: 'Nzambi a mpungu tuladila.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'admin@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Makanda', language: 'Kikongo', grammaticalCategory: 'noun', definition: 'Árvore; madeira.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Muamba', language: 'Kikongo', grammaticalCategory: 'noun', definition: 'Água.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator2@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Kamba', language: 'Kimbundu', grammaticalCategory: 'noun', definition: 'Leão.', usageExample: 'Kamba ietu.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'admin@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Ngana', language: 'Kimbundu', grammaticalCategory: 'noun', definition: 'Irmão; forma de tratamento entre iguais.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Mukaji', language: 'Kimbundu', grammaticalCategory: 'noun', definition: 'Mulher; esposa.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator2@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Ondjila', language: 'Umbundu', grammaticalCategory: 'noun', definition: 'Caminho; estrada.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'admin@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Ocimbundu', language: 'Umbundu', grammaticalCategory: 'noun', definition: 'Língua umbundu; povo ovimbundu.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Eteke', language: 'Umbundu', grammaticalCategory: 'noun', definition: 'Sol.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator2@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Chivanda', language: 'Cokwe', grammaticalCategory: 'noun', definition: 'Casa; habitação.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'admin@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Mukwa', language: 'Cokwe', grammaticalCategory: 'noun', definition: 'Árvore.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Kavango', language: 'Ngangela', grammaticalCategory: 'noun', definition: 'Rio; curso de água.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator2@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Omanu', language: 'Kwanyama', grammaticalCategory: 'noun', definition: 'Povo; gente.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'admin@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Omahona', language: 'Kwanyama', grammaticalCategory: 'noun', definition: 'Criança.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Omanu', language: 'Luvale', grammaticalCategory: 'noun', definition: 'Pessoas; comunidade.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'operator2@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Ngana', language: 'Mbunda', grammaticalCategory: 'noun', definition: 'Irmão; parente.', approvalStatus: ApprovalStatus.APPROVED, creatorEmail: 'admin@linguistic.com', approverEmail: 'supervisor@linguistic.com' },
  { term: 'Termo pendente', language: 'Fiote', grammaticalCategory: 'noun', definition: 'Exemplo de termo VOLNA em revisão.', approvalStatus: ApprovalStatus.PENDING_APPROVAL, creatorEmail: 'operator@linguistic.com' },
];

export const COVER_IMAGES = {
  language: 'https://images.unsplash.com/photo-1456513087680-7db5ce3e9352?w=1200&q=80',
  culture: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
  conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
  africa: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80',
  workshop: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
} as const;

type BlogSeed = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: PostType;
  status: PostStatus;
  category: string;
  tags: string[];
  isFeatured: boolean;
  coverImageUrl?: string;
  authorEmail: string;
  daysAgo?: number;
};

export const demoBlogPosts: BlogSeed[] = [
  {
    title: 'CN-IILP apresenta o VONALP: vocabulário ortográfico nacional',
    slug: 'cn-iilp-apresenta-vonalp',
    excerpt: 'A Comissão Nacional lança a primeira edição digital do Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa.',
    content: '<p>A CN-IILP apresentou oficialmente o <strong>VONALP</strong>, instrumento lexicográfico que consolida a variante ortográfica do português angolano. O vocabulário reúne milhares de entradas validadas por especialistas linguísticos.</p><p>O projecto visa apoiar a escrita normativa em escolas, media e administração pública, preservando a riqueza do português falado em Angola.</p>',
    type: PostType.ARTICLE,
    status: PostStatus.PUBLISHED,
    category: 'Institucional',
    tags: ['VONALP', 'ortografia', 'CN-IILP'],
    isFeatured: true,
    coverImageUrl: COVER_IMAGES.books,
    authorEmail: 'admin@linguistic.com',
    daysAgo: 3,
  },
  {
    title: 'Workshop de línguas nacionais reúne investigadores em Luanda',
    slug: 'workshop-linguas-nacionais-luanda',
    excerpt: 'Especialistas debateram estratégias de documentação e revitalização das línguas nacionais angolanas.',
    content: '<p>O workshop promovido pela CN-IILP reuniu linguistas, mestres de tradição oral e representantes de comunidades de Kimbundu, Umbundu e Kikongo.</p><p>Destacou-se o papel do <strong>VOLNA</strong> na preservação do património linguístico imaterial.</p>',
    type: PostType.EVENT_COVERAGE,
    status: PostStatus.PUBLISHED,
    category: 'Eventos',
    tags: ['VOLNA', 'línguas nacionais', 'workshop'],
    isFeatured: true,
    coverImageUrl: COVER_IMAGES.workshop,
    authorEmail: 'supervisor@linguistic.com',
    daysAgo: 7,
  },
  {
    title: 'Toponímia angolana: património na geografia e na língua',
    slug: 'toponimia-angolana-patrimonio',
    excerpt: 'Como os nomes de lugares contam a história de Angola e enriquecem o léxico português.',
    content: '<p>De Luanda a Mbanza Kongo, os topónimos angolanos carregam memórias de reinos, rios e paisagens. A equipa de topónimos da CN-IILP documenta gentílicos, variantes gráficas e proveniência histórica.</p>',
    type: PostType.ARTICLE,
    status: PostStatus.PUBLISHED,
    category: 'Linguística',
    tags: ['toponímia', 'geografia', 'património'],
    isFeatured: false,
    coverImageUrl: COVER_IMAGES.africa,
    authorEmail: 'operator@linguistic.com',
    daysAgo: 14,
  },
  {
    title: 'Neologismos digitais no português angolano',
    slug: 'neologismos-digitais-portugues-angolano',
    excerpt: 'Novas palavras surgem nas redes sociais e na linguagem dos jovens urbanos.',
    content: '<p>Termos como <em>influenciador</em> e adaptações locais entram no radar lexicográfico. A CN-IILP monitoriza a criação lexical na era digital.</p>',
    type: PostType.ARTICLE,
    status: PostStatus.PUBLISHED,
    category: 'Neologia',
    tags: ['neologia', 'digital', 'juventude'],
    isFeatured: true,
    coverImageUrl: COVER_IMAGES.language,
    authorEmail: 'operator2@linguistic.com',
    daysAgo: 5,
  },
  {
    title: 'Vídeo: Como consultar o dicionário público',
    slug: 'video-consultar-dicionario-publico',
    excerpt: 'Tutorial em vídeo para cidadãos e estudantes utilizarem o portal público.',
    content: '<p>Neste vídeo explicamos a pesquisa por verbetes, filtros por categoria gramatical e acesso ao VONALP-EP.</p>',
    type: PostType.VIDEO,
    status: PostStatus.PUBLISHED,
    category: 'Tutorial',
    tags: ['tutorial', 'dicionário', 'vídeo'],
    isFeatured: false,
    coverImageUrl: COVER_IMAGES.conference,
    authorEmail: 'admin@linguistic.com',
    daysAgo: 21,
  },
  {
    title: 'Galeria: Festa da Independência e expressões culturais',
    slug: 'galeria-festa-independencia',
    excerpt: 'Imagens da celebração nacional e do património cultural angolano.',
    content: '<p>Reportagem fotográfica das manifestações culturais que inspiram o léxico nacional.</p>',
    type: PostType.IMAGE,
    status: PostStatus.PUBLISHED,
    category: 'Cultura',
    tags: ['cultura', 'independência', 'galeria'],
    isFeatured: false,
    coverImageUrl: COVER_IMAGES.culture,
    authorEmail: 'supervisor@linguistic.com',
    daysAgo: 30,
  },
  {
    title: 'Aviso: Manutenção programada do portal',
    slug: 'aviso-manutencao-portal',
    excerpt: 'O portal público estará indisponível durante 2 horas no próximo domingo.',
    content: '<p>Manutenção de rotina para actualização de índices de pesquisa.</p>',
    type: PostType.ANNOUNCEMENT,
    status: PostStatus.PUBLISHED,
    category: 'Avisos',
    tags: ['manutenção', 'portal'],
    isFeatured: false,
    authorEmail: 'admin@linguistic.com',
    daysAgo: 1,
  },
  {
    title: 'Rascunho: Estratégia de comunicação 2026',
    slug: 'rascunho-estrategia-comunicacao-2026',
    excerpt: 'Documento interno em elaboração.',
    content: '<p>Conteúdo em desenvolvimento.</p>',
    type: PostType.ARTICLE,
    status: PostStatus.DRAFT,
    category: 'Institucional',
    tags: ['estratégia'],
    isFeatured: false,
    authorEmail: 'admin@linguistic.com',
  },
];

type EventSeed = {
  title: string;
  slug: string;
  description: string;
  category: string;
  location: string;
  status: EventStatus;
  maxRegistrations?: number;
  coverImageUrl?: string;
  creatorEmail: string;
  startDaysFromNow: number;
  durationDays: number;
  registrations?: Array<{
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    status: RegistrationStatus;
    attended?: boolean;
  }>;
};

export const demoEvents: EventSeed[] = [
  {
    title: 'Conferência Nacional de Língua Portuguesa',
    slug: 'conferencia-nacional-lingua-portuguesa-2026',
    description: 'Encontro anual de linguistas, educadores e editores para debater a norma ortográfica angolana e o VONALP.',
    category: 'Conferência',
    location: 'Auditório da CN-IILP, Luanda',
    status: EventStatus.PUBLISHED,
    maxRegistrations: 200,
    coverImageUrl: COVER_IMAGES.conference,
    creatorEmail: 'admin@linguistic.com',
    startDaysFromNow: 21,
    durationDays: 2,
    registrations: [
      { name: 'Helena Fernandes', email: 'helena.f@universidade.ao', phone: '+244923000001', organization: 'Universidade Agostinho Neto', status: RegistrationStatus.APPROVED },
      { name: 'Carlos Mendes', email: 'carlos.m@ministerio.gv.ao', organization: 'MINED', status: RegistrationStatus.APPROVED },
      { name: 'Rosa Paulo', email: 'rosa.paulo@gmail.com', phone: '+244923000003', status: RegistrationStatus.PENDING },
      { name: 'Miguel Tati', email: 'miguel.tati@escola.ao', organization: 'Escola Secundária', status: RegistrationStatus.APPROVED },
      { name: 'Teresa Kiala', email: 'teresa.k@ong.ao', organization: 'ONG Cultura Viva', status: RegistrationStatus.APPROVED },
    ],
  },
  {
    title: 'Formação de Operadores Lexicais',
    slug: 'formacao-operadores-lexicais-2026',
    description: 'Sessão prática de introdução ao back-office: criação de verbetes, fluxo de aprovação e marcação VONALP.',
    category: 'Formação',
    location: 'Sala de Formação CN-IILP, Luanda',
    status: EventStatus.PUBLISHED,
    maxRegistrations: 30,
    coverImageUrl: COVER_IMAGES.workshop,
    creatorEmail: 'supervisor@linguistic.com',
    startDaysFromNow: 10,
    durationDays: 1,
    registrations: [
      { name: 'Ana Catarina', email: 'ana.catarina@formacao.ao', organization: 'CN-IILP', status: RegistrationStatus.APPROVED },
      { name: 'Pedro Nunes', email: 'pedro.nunes@formacao.ao', status: RegistrationStatus.APPROVED },
      { name: 'Isabel Costa', email: 'isabel.costa@formacao.ao', status: RegistrationStatus.PENDING },
    ],
  },
  {
    title: 'Lançamento do VOLNA — Edição Kimbundu',
    slug: 'lancamento-volna-kimbundu',
    description: 'Apresentação pública da colecção de termos em Kimbundu no Vocabulário das Línguas Nacionais de Angola.',
    category: 'Lançamento',
    location: 'Centro Cultural, Luanda',
    status: EventStatus.PUBLISHED,
    maxRegistrations: 150,
    coverImageUrl: COVER_IMAGES.culture,
    creatorEmail: 'admin@linguistic.com',
    startDaysFromNow: 35,
    durationDays: 1,
    registrations: [
      { name: 'Mestre Kiluanje', email: 'kiluanje@tradicao.ao', organization: 'Associação Cultural', status: RegistrationStatus.APPROVED },
      { name: 'Fernanda M.', email: 'fernanda.m@gmail.com', status: RegistrationStatus.APPROVED },
    ],
  },
  {
    title: 'Seminário de Toponímia (realizado)',
    slug: 'seminario-toponimia-2025',
    description: 'Seminário sobre normalização de topónimos angolanos — edição já realizada.',
    category: 'Seminário',
    location: 'Huambo',
    status: EventStatus.PUBLISHED,
    creatorEmail: 'supervisor@linguistic.com',
    startDaysFromNow: -45,
    durationDays: 1,
    registrations: [
      { name: 'João Silva', email: 'joao.silva@huambo.ao', status: RegistrationStatus.ATTENDED, attended: true },
      { name: 'Maria José', email: 'maria.jose@huambo.ao', status: RegistrationStatus.ATTENDED, attended: true },
      { name: 'António Bessa', email: 'antonio.bessa@huambo.ao', status: RegistrationStatus.CANCELLED },
    ],
  },
  {
    title: 'Evento em planeamento (rascunho)',
    slug: 'evento-planeamento-rascunho',
    description: 'Evento ainda não publicado.',
    category: 'Interno',
    location: 'A definir',
    status: EventStatus.DRAFT,
    creatorEmail: 'admin@linguistic.com',
    startDaysFromNow: 60,
    durationDays: 1,
  },
];

export const VONALP_ORIGINS: Record<VonalpSourceType, string> = {
  [VonalpSourceType.ENTRY]: 'Dicionário',
  [VonalpSourceType.TOPONYM]: 'Topónimo',
  [VonalpSourceType.ANTHROPONYM]: 'Antropónimo',
  [VonalpSourceType.FOREIGNISM]: 'Estrangeirismo',
};

export function buildCompleteVonalpTerm(params: {
  vocabularyType: VonalpVocabularyType;
  sourceType: VonalpSourceType;
  sourceId: string;
  term: string;
  pronunciation: string;
  grammaticalCategory: string;
  grammaticalSubcategory: string;
  syllabicDivision: string;
  etymology: string;
  firstDefinition: string;
  secondDefinition?: string;
  origin: string;
  sourceCreatedById?: string;
  createdById: string;
}) {
  return {
    vocabularyType: params.vocabularyType,
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    term: params.term,
    pronunciation: params.pronunciation,
    grammaticalCategory: params.grammaticalCategory,
    grammaticalSubcategory: params.grammaticalSubcategory,
    syllabicDivision: params.syllabicDivision,
    etymology: params.etymology,
    firstDefinition: params.firstDefinition,
    secondDefinition: params.secondDefinition ?? null,
    origin: params.origin,
    completionStatus: VonalpCompletionStatus.COMPLETE,
    missingFields: [] as string[],
    completedAt: new Date(),
    sourceCreatedById: params.sourceCreatedById,
    createdById: params.createdById,
    updatedById: params.createdById,
  };
}
