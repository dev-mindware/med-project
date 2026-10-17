"use client";

import { useMemo } from "react";
import { useDashboardStats } from "@/hooks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { FileText, ShieldCheck, Database, Layers, CheckCircle } from "lucide-react";

const DEFAULT_DOC_CATEGORIES = [
  { name: "Jornais & Periódicos", value: 263, color: "#3B82F6" },
  { name: "Comunicados Oficiais", value: 177, color: "#6366F1" },
  { name: "Legislação & Normas", value: 68, color: "#8B5CF6" },
  { name: "Livros & Manuais", value: 63, color: "#10B981" },
  { name: "Economia & Finanças", value: 40, color: "#F59E0B" },
  { name: "Apresentações", value: 32, color: "#EC4899" },
];

export function CorpusProvenanceCard() {
  const { data } = useDashboardStats();

  const docCategories = useMemo(() => {
    const apiCats = data?.charts?.corpus?.categories || data?.corpus?.categories;
    if (apiCats && apiCats.length > 0) {
      return apiCats.map((item, i) => ({
        name: item.name,
        value: item.value,
        color: DEFAULT_DOC_CATEGORIES[i]?.color || "#3B82F6",
      }));
    }
    return DEFAULT_DOC_CATEGORIES;
  }, [data]);

  const totalDocs = useMemo(() => {
    return data?.corpus?.sourceDocumentsTotal || data?.charts?.corpus?.sourceDocumentsTotal || 643;
  }, [data]);

  const totalOccurrences = useMemo(() => {
    return data?.corpus?.termOccurrencesTotal || data?.charts?.corpus?.termOccurrencesTotal || 617520;
  }, [data]);

  const chartConfig = useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {
      value: { label: "PDFs" },
    };
    docCategories.forEach((cat) => {
      cfg[cat.name] = { label: cat.name, color: cat.color };
    });
    return cfg;
  }, [docCategories]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Corpus Sources Breakdown */}
      <Card className="lg:col-span-7 border shadow-soft-sm bg-card overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">
                Documentos Fonte do Corpus MED
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {totalDocs.toLocaleString("pt-PT")} PDFs escolares e oficiais minerados com SHA-256
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10 py-1">
            <Database className="w-3.5 h-3.5" />
            {totalOccurrences.toLocaleString("pt-PT")} Ocorrências
          </Badge>
        </CardHeader>

        <CardContent className="pt-6">
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={docCategories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {docCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t">
            {docCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/40">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground truncate">{cat.name}</p>
                  <p className="text-xs font-bold text-foreground tabular-nums">{cat.value.toLocaleString("pt-PT")} docs</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rigor Editorial & Quality Audit */}
      <Card className="lg:col-span-5 border shadow-soft-sm bg-card overflow-hidden flex flex-col">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">
                Rigor Editorial & AO45
              </CardTitle>
            </div>
            <Badge variant="success" className="text-xs font-semibold py-1">
              100% Conforme
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Garantias metodológicas da curadoria lexicográfica
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 flex-1 flex flex-col justify-between space-y-3.5">
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Definições Lexicográficas Autênticas
              </span>
              <span className="text-xs font-extrabold text-emerald-600">100%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              0 definições genéricas ou circulares. Todas extraídas de Cândido de Figueiredo.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Divisão Silábica AO45
              </span>
              <span className="text-xs font-extrabold text-blue-600">100%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              200.500 entradas com separação rigorosa de dígrafos e consoantes mudas.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                Pronúncia com Destaque Tónico
              </span>
              <span className="text-xs font-extrabold text-purple-600">100%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sílaba tónica em maiúsculas com classificação oxítona / paroxítona / proparoxítona.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                Etimologia Histórica & Filológica
              </span>
              <span className="text-xs font-extrabold text-amber-600">100%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Raízes latinas, gregas, árabes e bantas (kimbundu / umbundu / kikongo).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
