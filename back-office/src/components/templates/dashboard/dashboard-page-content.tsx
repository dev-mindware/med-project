"use client";

import Link from "next/link";
import { StatsCards } from "./stats-cards";
import { GrammaticalDistributionCard } from "./grammatical-distribution-card";
import { CorpusProvenanceCard } from "./corpus-provenance-card";
import { ActivityCharts } from "./activity-charts";
import { RecentActivity } from "./recent-activity";
import { TitleList } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, ArrowUpRight } from "lucide-react";

export function DashboardPageContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* Mindgest-inspired Top Header Banner */}
      <TitleList
        title="Painel de Controlo & Acervo Lexicográfico"
        suTitle="Monitorização em tempo real das 200.500 entradas, proveniência de 643 PDFs escolares e conformidade estrita ao AO45."
      >
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-primary py-1 px-3 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Meta de 200k Atingida
          </Badge>
          <Button asChild size="sm" className="gap-1.5 h-8 text-xs font-medium">
            <Link href="/vonalp/entries">
              <BookOpen className="w-3.5 h-3.5" />
              Explorar Vocabulário
              <ArrowUpRight className="w-3 h-3 opacity-70" />
            </Link>
          </Button>
        </div>
      </TitleList>

      {/* Metric Cards Row */}
      <StatsCards />

      {/* Prominent KPI: Grammatical Category Distribution (Requested in User Photo) */}
      <GrammaticalDistributionCard />

      {/* Corpus Provenance & Editorial Quality Indicators */}
      <CorpusProvenanceCard />

      {/* Activity and Status Breakdown */}
      <ActivityCharts />

      {/* Recent Activity and Team Contributions */}
      <RecentActivity />
    </div>
  );
}
