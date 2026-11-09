"use client";

import { useMemo } from "react";
import { useDashboardStats } from "@/hooks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label } from "recharts";
import { BookOpen, Sparkles, CheckCircle2 } from "lucide-react";

interface CategoryItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  description: string;
}

const CATEGORY_META: Record<string, { description: string; color: string }> = {
  "Substantivos": {
    description: "Substantivos comuns, próprios, abstractos e colectivos catalogados",
    color: "#2563EB", // Blue 600
  },
  "Adjectivos": {
    description: "Qualificativos, relacionais e formas biformes/uniformes",
    color: "#059669", // Emerald 600
  },
  "Advérbios": {
    description: "Advérbios de modo, tempo, lugar, afirmação, negação e intensidade",
    color: "#8B5CF6", // Violet 600
  },
  "Verbos": {
    description: "Formas infinitivas transitivas, intransitivas e pronominais",
    color: "#D97706", // Amber 600
  },
  "Pronomes": {
    description: "Pronomes pessoais, possessivos, demonstrativos e relativos",
    color: "#0284C7", // Sky 600
  },
  "Interjeições": {
    description: "Expressões emotivas, apelativas e fórmulas conversacionais",
    color: "#EC4899", // Pink 600
  },
  "Outras Classes": {
    description: "Preposições, conjunções, numerais e artigos relacionais",
    color: "#64748B", // Slate 500
  },
};

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    name: "Substantivos",
    value: 145921,
    percentage: 58.3,
    color: "#2563EB",
    description: "Substantivos comuns, próprios, abstractos e colectivos catalogados",
  },
  {
    name: "Adjectivos",
    value: 67407,
    percentage: 26.9,
    color: "#059669",
    description: "Qualificativos, relacionais e formas biformes/uniformes",
  },
  {
    name: "Advérbios",
    value: 19997,
    percentage: 8.0,
    color: "#8B5CF6",
    description: "Advérbios de modo, tempo, lugar, afirmação, negação e intensidade",
  },
  {
    name: "Verbos",
    value: 16549,
    percentage: 6.6,
    color: "#D97706",
    description: "Formas infinitivas transitivas, intransitivas e pronominais",
  },
  {
    name: "Pronomes",
    value: 84,
    percentage: 0.1,
    color: "#0284C7",
    description: "Pronomes pessoais, possessivos, demonstrativos e relativos",
  },
  {
    name: "Interjeições",
    value: 239,
    percentage: 0.1,
    color: "#EC4899",
    description: "Expressões emotivas, apelativas e fórmulas conversacionais",
  },
  {
    name: "Outras Classes",
    value: 106,
    percentage: 0.1,
    color: "#64748B",
    description: "Preposições, conjunções, numerais e artigos relacionais",
  },
];

export function GrammaticalDistributionCard() {
  const { data } = useDashboardStats();

  const categories = useMemo<CategoryItem[]>(() => {
    const apiCats = data?.charts?.grammaticalCategories;
    if (apiCats && apiCats.length > 0) {
      return apiCats.map((cat, i) => {
        const meta = CATEGORY_META[cat.name] || DEFAULT_CATEGORIES[i];
        return {
          name: cat.name,
          value: cat.value,
          percentage: cat.percentage,
          color: cat.color || meta?.color || "#2563EB",
          description: meta?.description || "Classe gramatical",
        };
      });
    }
    return DEFAULT_CATEGORIES;
  }, [data]);

  const total = useMemo(() => {
    return categories.reduce((sum, item) => sum + item.value, 0);
  }, [categories]);

  const chartConfig = useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {
      value: { label: "Vocábulos" },
    };
    categories.forEach((cat) => {
      cfg[cat.name] = {
        label: cat.name,
        color: cat.color,
      };
    });
    return cfg;
  }, [categories]);

  const pieData = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name,
      value: cat.value,
      fill: cat.color,
    }));
  }, [categories]);

  return (
    <Card className="border shadow-soft-sm bg-card overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Organização por Categoria Gramatical
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Composição morfossintáctica detalhada das entradas lexicográficas catalogadas no acervo
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" className="gap-1 text-[11px] font-semibold py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Padrão Oficial Conforme
          </Badge>
          <Badge variant="default" className="gap-1 text-[11px] font-semibold py-1 bg-primary/15 text-primary border-primary/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Acervo Integral
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart Visualizer */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[280px] aspect-square">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={105}
                    paddingAngle={3}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy ?? 0) - 6}
                                className="fill-foreground text-3xl font-extrabold tracking-tight"
                              >
                                {total.toLocaleString("pt-PT")}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy ?? 0) + 18}
                                className="fill-muted-foreground text-xs font-medium uppercase tracking-wider"
                              >
                                Vocábulos Registados
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Passe o cursor sobre os segmentos para detalhes
            </p>
          </div>

          {/* Detailed KPI List with Progress Bars */}
          <div className="lg:col-span-7 space-y-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-sm text-foreground truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {cat.value.toLocaleString("pt-PT")}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-semibold text-xs tabular-nums px-2 py-0.5 border"
                      style={{
                        borderColor: `${cat.color}40`,
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                      }}
                    >
                      {cat.percentage.toFixed(1).replace(".", ",")}%
                    </Badge>
                  </div>
                </div>

                <div className="relative w-full">
                  <Progress
                    value={cat.percentage}
                    className="h-2 bg-muted/60"
                    indicatorClassName="transition-all duration-700 ease-out"
                    style={
                      {
                        "--progress-color": cat.color,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, cat.percentage)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground truncate">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
