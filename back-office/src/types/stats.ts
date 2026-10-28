export interface GrammaticalCategoryStat {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface CorpusStats {
  sourceDocumentsTotal: number;
  termOccurrencesTotal: number;
  categories: Array<{ name: string; value: number }>;
}

export interface QualityKpis {
  ao45PhoneticCompliance: number;
  ao45SyllabicCompliance: number;
  authenticDefinitionsRate: number;
  genericDefinitions: number;
}

export interface DashboardStats {
  cards: Array<{
    label: string;
    value: number;
    icon: string;
    color: string;
    description?: string;
  }>;
  charts: {
    moduleDistribution: Array<{ name: string; value: number }>;
    statusDistribution: Array<{ name: string; value: number }>;
    vocabularyStats: Array<{ name: string; value: number }>;
    grammaticalCategories?: GrammaticalCategoryStat[];
    subcategories?: Array<{ name: string; value: number }>;
    corpus?: CorpusStats;
    qualityKpis?: QualityKpis;
  };
  corpus?: CorpusStats;
  qualityKpis?: QualityKpis;
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    user: string;
  }>;
  topContributors: Array<{
    name: string;
    role?: string;
    count: number;
  }>;
}

