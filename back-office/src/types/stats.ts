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
  };
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
