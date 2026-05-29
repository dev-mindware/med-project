"use client";

import { useDashboardStats } from "@/hooks";
import { EmptyState } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

// Shades of primary blue — adapts to light/dark via CSS var
const PALETTE = [
  "hsl(217 91% 53%)",
  "hsl(217 91% 67%)",
  "hsl(217 91% 77%)",
  "hsl(217 91% 41%)",
  "hsl(217 91% 28%)",
];

// Vocabulary type colour mapping
const VOCAB_PALETTE: Record<string, string> = {
  "VONALP":    "hsl(217 91% 53%)",
  "VONALP-EP": "hsl(217 91% 67%)",
  "Outros":    "hsl(217 91% 80%)",
};
const VOCAB_FALLBACK = "hsl(217 91% 53%)";

export function ActivityCharts() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="col-span-3 h-[280px] rounded-2xl" />
          <Skeleton className="col-span-2 h-[280px] rounded-2xl" />
        </div>
        <Skeleton className="h-[180px] w-full rounded-2xl" />
      </div>
    );
  }

  const moduleData = data?.charts.moduleDistribution || [];
  const statusData = data?.charts.statusDistribution || [];
  const vocabData  = data?.charts.vocabularyStats    || [];
  const totalStatus = statusData.reduce((acc, cur) => acc + cur.value, 0);
  const totalVocab  = vocabData.reduce((acc, cur) => acc + cur.value, 0);

  if (
    moduleData.length === 0 &&
    statusData.length === 0 &&
    vocabData.length === 0
  ) {
    return (
      <EmptyState
        icon="ChartPie"
        title="Sem gráficos disponíveis"
        description="Os gráficos serão apresentados quando houver dados estatísticos."
        className="mt-0"
      />
    );
  }

  // ChartConfig: bar chart
  const barConfig: ChartConfig = {
    value: { label: "Total" },
    ...Object.fromEntries(
      moduleData.map((item, i) => [
        item.name,
        { label: item.name, color: PALETTE[i % PALETTE.length] },
      ])
    ),
  };

  // ChartConfig: donut chart
  const pieConfig: ChartConfig = {
    value: { label: "Registos" },
    ...Object.fromEntries(
      statusData.map((item, i) => [
        item.name,
        { label: item.name, color: PALETTE[i % PALETTE.length] },
      ])
    ),
  };

  // ChartConfig: vocab horizontal bar chart
  const vocabConfig: ChartConfig = {
    value: { label: "Termos" },
    ...Object.fromEntries(
      vocabData.map((item) => [
        item.name,
        { label: item.name, color: VOCAB_PALETTE[item.name] ?? VOCAB_FALLBACK },
      ])
    ),
  };

  const pieDataWithFill = statusData.map((item, i) => ({
    ...item,
    fill: PALETTE[i % PALETTE.length],
  }));

  const vocabDataWithFill = vocabData.map((item) => ({
    ...item,
    fill: VOCAB_PALETTE[item.name] ?? VOCAB_FALLBACK,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1 — module bar + status donut */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Bar chart — module distribution */}
        <div className="col-span-3 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Distribuição por Módulo
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total de registos em cada categoria linguística
            </p>
          </div>
          <ChartContainer config={barConfig} className="h-[210px] w-full">
            <BarChart data={moduleData} margin={{ left: 0, right: 0 }}>
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
                {moduleData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {/* Donut chart — status distribution */}
        <div className="col-span-2 bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Estado de Aprovação
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Resumo do estado dos registos
            </p>
          </div>
          <ChartContainer config={pieConfig} className="flex-1 min-h-[170px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={pieDataWithFill}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={82}
                strokeWidth={2}
                stroke="hsl(var(--card))"
              >
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
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalStatus.toLocaleString("pt-PT")}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 20}
                            className="fill-muted-foreground text-[11px]"
                          >
                            registos
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          {/* Legend */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
            {statusData.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />
                {item.name}
                <span className="font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 — VONALP vocabulary stats (horizontal bar chart) */}
      {vocabData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Vocabulário VONALP
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribuição de termos por tipo de vocábulo
              </p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {totalVocab.toLocaleString("pt-PT")} termos
            </span>
          </div>

          {/* Inline horizontal progress bars */}
          <div className="flex flex-col gap-3">
            {vocabDataWithFill.map((item) => {
              const pct = totalVocab > 0 ? Math.round((item.value / totalVocab) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {item.value.toLocaleString("pt-PT")} termos
                      </span>
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${item.fill}20`,
                          color: item.fill,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: item.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional mini bar chart for visual comparison */}
          <div className="mt-5">
            <ChartContainer config={vocabConfig} className="h-[100px] w-full">
              <BarChart
                data={vocabDataWithFill}
                layout="vertical"
                margin={{ left: 0, right: 8 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={90}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {vocabDataWithFill.map((item, i) => (
                    <Cell key={i} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      )}
    </div>
  );
}
