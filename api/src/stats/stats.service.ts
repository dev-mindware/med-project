import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, ApprovalStatus, PostStatus, Prisma } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardGlobal() {
    const [
      userStats,
      contentStats,
      blogStats,
      eventStats,
      recentActivity,
      topContributors,
    ] = await Promise.all([
      this.getUserStats(),
      this.getContentStats(),
      this.getBlogStats(),
      this.getEventStats(),
      this.getRecentActivity(),
      this.getTopContributors(),
    ]);

    const trunc = (str: string) => str.length > 40 ? str.slice(0, 37) + '...' : str;

    const approvalRate = contentStats.total > 0
      ? Math.round((contentStats.approved / contentStats.total) * 100)
      : 0;

    const pendingRate = contentStats.total > 0
      ? Math.round((contentStats.pendingApproval / contentStats.total) * 100)
      : 0;

    const cards = [
      {
        label: 'Total de Registos',
        value: contentStats.total,
        icon: 'FileText',
        color: 'blue',
        description: trunc(
          contentStats.total === 0
            ? 'Nenhum registo no sistema'
            : `${contentStats.entries} entradas, ${contentStats.anthroponyms} antrop.`,
        ),
      },
      {
        label: 'Pendentes de Aprovação',
        value: contentStats.pendingApproval,
        icon: 'Clock',
        color: 'orange',
        description: trunc(
          contentStats.pendingApproval === 0
            ? 'Nada para rever'
            : `${pendingRate}% do total a aguardar revisão`,
        ),
      },
      {
        label: 'Registos Aprovados',
        value: contentStats.approved,
        icon: 'CheckCircle',
        color: 'green',
        description: trunc(
          contentStats.total === 0
            ? 'Sem registos ainda'
            : `${approvalRate}% de aprovação no sistema`,
        ),
      },
      {
        label: 'Utilizadores Ativos',
        value: userStats.active,
        icon: 'Users',
        color: 'purple',
        description: trunc(
          userStats.total === 0
            ? 'Sem utilizadores registados'
            : `${userStats.active} de ${userStats.total} utilizadores`,
        ),
      },
    ];

    const charts = this.buildCharts(contentStats);

    return {
      cards,
      charts,
      recentActivity,
      topContributors,
      users: userStats,
      content: contentStats,
      blog: blogStats,
      events: eventStats,
      summary: {
        users: userStats,
        content: contentStats,
        blog: blogStats,
        events: eventStats,
      },
    };
  }

  private async getUserStats() {
    const total = await this.prisma.user.count();
    const active = await this.prisma.user.count({ where: { isActive: true } });
    const admins = await this.prisma.user.count({ where: { role: UserRole.ADMIN } });
    const supervisors = await this.prisma.user.count({ where: { role: UserRole.SUPERVISOR } });
    const operators = await this.prisma.user.count({ where: { role: UserRole.OPERATOR } });

    return { total, active, inactive: total - active, admins, supervisors, operators };
  }

  private async getContentStats(where?: { createdById?: string }) {
    const [entries, anthroponyms, toponyms, foreignisms, neologisms] = await Promise.all([
      this.prisma.entry.count({ where }),
      this.prisma.anthroponym.count({ where }),
      this.prisma.toponym.count({ where }),
      this.prisma.foreignism.count({ where }),
      this.prisma.neologism.count({ where }),
    ]);

    const total = entries + anthroponyms + toponyms + foreignisms + neologisms;

    const [
      approved,
      pendingApproval,
      drafts,
      needsCorrection,
      vocabulary,
      vocabularyEP,
    ] = await Promise.all([
      this.countAcrossModules({ ...where, approvalStatus: ApprovalStatus.APPROVED }),
      this.countAcrossModules({ ...where, approvalStatus: ApprovalStatus.PENDING_APPROVAL }),
      this.countAcrossModules({ ...where, approvalStatus: ApprovalStatus.DRAFT }),
      this.countAcrossModules({ ...where, approvalStatus: ApprovalStatus.NEEDS_CORRECTION }),
      this.countAcrossModules({ ...where, isVocabulary: true }),
      this.countAcrossModules({ ...where, isVocabularyEP: true }),
    ]);

    return {
      total,
      entries,
      anthroponyms,
      toponyms,
      foreignisms,
      neologisms,
      approved,
      pendingApproval,
      drafts,
      needsCorrection,
      vocabulary,
      vocabularyEP,
    };
  }

  private async countAcrossModules(where: {
    createdById?: string;
    approvalStatus?: ApprovalStatus;
    isVocabulary?: boolean;
    isVocabularyEP?: boolean;
  }) {
    const [e, a, t, f, n] = await Promise.all([
      this.prisma.entry.count({ where }),
      this.prisma.anthroponym.count({ where }),
      this.prisma.toponym.count({ where }),
      this.prisma.foreignism.count({ where }),
      this.prisma.neologism.count({ where }),
    ]);
    return e + a + t + f + n;
  }

  private async getBlogStats() {
    const total = await this.prisma.blogPost.count();
    const published = await this.prisma.blogPost.count({ where: { status: PostStatus.PUBLISHED } });
    const drafts = await this.prisma.blogPost.count({ where: { status: PostStatus.DRAFT } });

    return { total, published, drafts };
  }

  private async getEventStats() {
    const total = await this.prisma.event.count();
    const now = new Date();
    const upcoming = await this.prisma.event.count({ where: { startDate: { gt: now } } });
    const ongoing = await this.prisma.event.count({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    return { total, upcoming, ongoing, past: total - upcoming - ongoing };
  }

  private async getRecentActivity(createdById?: string) {
    const take = 6;
    const where = createdById ? { createdById } : undefined;
    const [e, a, t, f, n] = await Promise.all([
      this.prisma.entry.findMany({ where, take, orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { name: true } } } }),
      this.prisma.anthroponym.findMany({ where, take, orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { name: true } } } }),
      this.prisma.toponym.findMany({ where, take, orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { name: true } } } }),
      this.prisma.foreignism.findMany({ where, take, orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { name: true } } } }),
      this.prisma.neologism.findMany({ where, take, orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { name: true } } } }),
    ]);

    const activity = [
      ...e.map(i => ({ id: i.id, title: i.entry, type: 'Entrada', date: i.createdAt, user: i.createdBy?.name ?? 'Sistema' })),
      ...a.map(i => ({ id: i.id, title: i.name, type: 'Antropónimo', date: i.createdAt, user: i.createdBy?.name ?? 'Sistema' })),
      ...t.map(i => ({ id: i.id, title: i.toponym, type: 'Topónimo', date: i.createdAt, user: i.createdBy?.name ?? 'Sistema' })),
      ...f.map(i => ({ id: i.id, title: i.term, type: 'Estrangeirismo', date: i.createdAt, user: i.createdBy?.name ?? 'Sistema' })),
      ...n.map(i => ({ id: i.id, title: i.entry, type: 'Neologismo', date: i.createdAt, user: i.createdBy?.name ?? 'Sistema' })),
    ];

    return activity.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, take);
  }

  private async getTopContributors() {
    const [entries, anthroponyms, toponyms, foreignisms, neologisms] = await Promise.all([
      this.groupContributorsByModule('entry'),
      this.groupContributorsByModule('anthroponym'),
      this.groupContributorsByModule('toponym'),
      this.groupContributorsByModule('foreignism'),
      this.groupContributorsByModule('neologism'),
    ]);

    const counts = new Map<string, number>();
    [...entries, ...anthroponyms, ...toponyms, ...foreignisms, ...neologisms].forEach((item) => {
      if (!item.createdById) return;
      counts.set(item.createdById, (counts.get(item.createdById) ?? 0) + item._count._all);
    });

    const top = [...counts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return Promise.all(
      top.map(async ([userId, count]) => {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, role: true, isActive: true },
        });

        if (!user?.isActive) return null;

        return {
          name: user?.name || 'Sistema',
          role: user?.role,
          count,
        };
      }),
    ).then((contributors) => contributors.filter(Boolean));
  }

  private async groupContributorsByModule(
    model: 'entry' | 'anthroponym' | 'toponym' | 'foreignism' | 'neologism',
  ): Promise<Array<{ createdById: string | null; _count: { _all: number } }>> {
    switch (model) {
      case 'entry':
        return this.prisma.entry.groupBy({
          by: ['createdById'] as ['createdById'],
          where: { createdById: { not: null } },
          _count: { _all: true },
        });
      case 'anthroponym':
        return this.prisma.anthroponym.groupBy({
          by: ['createdById'] as ['createdById'],
          where: { createdById: { not: null } },
          _count: { _all: true },
        });
      case 'toponym':
        return this.prisma.toponym.groupBy({
          by: ['createdById'] as ['createdById'],
          where: { createdById: { not: null } },
          _count: { _all: true },
        });
      case 'foreignism':
        return this.prisma.foreignism.groupBy({
          by: ['createdById'] as ['createdById'],
          where: { createdById: { not: null } },
          _count: { _all: true },
        });
      case 'neologism':
        return this.prisma.neologism.groupBy({
          by: ['createdById'] as ['createdById'],
          where: { createdById: { not: null } },
          _count: { _all: true },
        });
    }
  }

  private buildCharts(contentStats: Awaited<ReturnType<StatsService['getContentStats']>>) {
    return {
      moduleDistribution: [
        { name: 'Entradas', value: contentStats.entries },
        { name: 'Antropónimos', value: contentStats.anthroponyms },
        { name: 'Topónimos', value: contentStats.toponyms },
        { name: 'Estrangeirismos', value: contentStats.foreignisms },
        { name: 'Neologismos', value: contentStats.neologisms },
      ],
      statusDistribution: [
        { name: 'Aprovados', value: contentStats.approved },
        { name: 'Pendentes', value: contentStats.pendingApproval },
        { name: 'Rascunhos', value: contentStats.drafts },
        { name: 'Correção', value: contentStats.needsCorrection },
      ],
      vocabularyStats: [
        { name: 'VONALP', value: contentStats.vocabulary },
        { name: 'VONALP-EP', value: contentStats.vocabularyEP },
        { name: 'Outros', value: contentStats.total - contentStats.vocabulary - contentStats.vocabularyEP },
      ],
    };
  }

  async getUserDashboard(userId: string, role: UserRole) {
    if (role === UserRole.ADMIN || role === UserRole.SUPERVISOR) {
      return this.getDashboardGlobal();
    }

    const [contentStats, recentActivity, user] = await Promise.all([
      this.getContentStats({ createdById: userId }),
      this.getRecentActivity(userId),
      this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } }),
    ]);

    const approvalRate = contentStats.total > 0
      ? Math.round((contentStats.approved / contentStats.total) * 100)
      : 0;

    return {
      cards: [
        {
          label: 'O Meu Conteúdo',
          value: contentStats.total,
          icon: 'FileText',
          color: 'blue',
          description: contentStats.total === 0
            ? 'Nenhum registo criado'
            : `${contentStats.entries} entradas, ${contentStats.neologisms} neologismos`,
        },
        {
          label: 'Aprovados',
          value: contentStats.approved,
          icon: 'CheckCircle',
          color: 'green',
          description: contentStats.total === 0 ? 'Sem registos ainda' : `${approvalRate}% dos seus registos`,
        },
        {
          label: 'Pendentes',
          value: contentStats.pendingApproval,
          icon: 'Clock',
          color: 'orange',
          description: contentStats.pendingApproval === 0 ? 'Nada a aguardar revisão' : 'Aguardam validação',
        },
        {
          label: 'Necessitam Correção',
          value: contentStats.needsCorrection,
          icon: 'AlertCircle',
          color: 'red',
          description: contentStats.needsCorrection === 0 ? 'Sem pedidos de correção' : 'Requerem actualização',
        },
      ],
      charts: this.buildCharts(contentStats),
      recentActivity,
      topContributors: contentStats.total > 0 ? [
        {
          name: user?.name || 'Meu perfil',
          role: user?.role,
          count: contentStats.total,
        },
      ] : [],
      summary: {
        content: contentStats,
        details: {
          entries: contentStats.entries,
          anthroponyms: contentStats.anthroponyms,
          toponyms: contentStats.toponyms,
          foreignisms: contentStats.foreignisms,
          neologisms: contentStats.neologisms,
        },
      },
    };
  }
}
