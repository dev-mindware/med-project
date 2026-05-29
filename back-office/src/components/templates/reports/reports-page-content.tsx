"use client";

import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { ButtonOnlyAction, Column, EmptyState, GenericTable, Icon, ListPageSkeleton, RequestError, TitleList } from "@/components/common";
import { usePagination } from "@/hooks/common";
import { useDownloadReport } from "@/hooks";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { ReportFormat, ReportHistoryResponse, ReportType } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const reportTypes: Array<{
  type: ReportType;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Icon>["name"];
}> = [
  {
    type: "users",
    title: "Utilizadores",
    description: "Lista de utilizadores, funções, estado e data de registo.",
    icon: "Users",
  },
  {
    type: "activity",
    title: "Atividade",
    description: "Últimas acções registadas nos logs de auditoria.",
    icon: "History",
  },
  {
    type: "summary",
    title: "Resumo geral",
    description: "Totais principais do acervo linguístico e da operação.",
    icon: "ChartBar",
  },
];

const formatLabels: Record<ReportFormat, string> = {
  xlsx: "Excel",
  pdf: "PDF",
};

export function ReportsPageContent() {
  const downloadReport = useDownloadReport();
  const {
    data,
    total,
    totalPages,
    page,
    setPage,
    isLoading,
    isError,
    refetch,
    goToNextPage,
    goToPreviousPage,
  } = usePagination<ReportHistoryResponse>({
    endpoint: "/reports/history",
    queryKey: ["reports-history"],
    queryParams: { limit: 10 },
  });

  const handleDownload = async (type: ReportType, format: ReportFormat) => {
    try {
      await downloadReport.mutateAsync({ type, format });
      SucessMessage(`Relatório ${formatLabels[format]} gerado com sucesso`);
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Não foi possível gerar o relatório");
    }
  };

  const columns: Column<ReportHistoryResponse>[] = [
    {
      key: "type",
      header: "Relatório",
      render: (_, report) => (
        <div className="flex flex-col">
          <span className="font-medium">{getReportLabel(report.type)}</span>
          <span className="text-xs text-muted-foreground">{report.filename}</span>
        </div>
      ),
    },
    {
      key: "parameters",
      header: "Formato",
      render: (_, report) => (
        <Badge variant="secondary">{formatLabels[(report.parameters?.format || "xlsx") as ReportFormat]}</Badge>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, report) => (
        <Badge variant={report.status === "COMPLETED" ? "success" : report.status === "FAILED" ? "destructive" : "pending"}>
          {translateStatus(report.status)}
        </Badge>
      ),
    },
    {
      key: "generatedBy",
      header: "Gerado por",
      render: (_, report) => (
        <span className="text-sm">{report.generatedBy?.name || "Sistema"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Data",
      render: (_, report) => (
        <span className="text-sm">
          {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[70px]",
      render: (_, report) => (
        <ButtonOnlyAction
          data={report}
          actions={[
            {
              label: "Gerar novamente",
              icon: "Download",
              onClick: (item) => handleDownload(item.type as ReportType, (item.parameters?.format || "xlsx") as ReportFormat),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="mt-6 space-y-8">
      <TitleList
        title="Relatórios"
        suTitle="Gere ficheiros Excel e PDF com estilo padronizado para análise e arquivamento."
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.type} className="rounded-lg border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Icon name={report.icon} className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => handleDownload(report.type, "xlsx")}
                loading={downloadReport.isPending}
              >
                <Icon name="FileSpreadsheet" className="h-4 w-4" />
                Excel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownload(report.type, "pdf")}
                loading={downloadReport.isPending}
              >
                <Icon name="FileText" className="h-4 w-4" />
                PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <TitleList
          title="Histórico"
          suTitle="Últimos relatórios gerados no sistema."
        />

        {isLoading ? (
          <ListPageSkeleton cols={6} rows={8} showAction />
        ) : isError ? (
          <RequestError refetch={refetch} message="Erro ao carregar o histórico de relatórios" />
        ) : data.length > 0 ? (
          <GenericTable<ReportHistoryResponse>
            data={data}
            columns={columns}
            total={total}
            totalPages={totalPages}
            page={page}
            setPage={setPage}
            goToNextPage={goToNextPage}
            goToPreviousPage={goToPreviousPage}
            emptyMessage="Nenhum relatório encontrado."
          />
        ) : (
          <EmptyState
            title="Nenhum relatório gerado"
            description="Gere um relatório em Excel ou PDF para preencher o histórico."
            icon="FileText"
          />
        )}
      </section>
    </div>
  );
}

function getReportLabel(type: string) {
  return {
    users: "Utilizadores",
    activity: "Atividade",
    summary: "Resumo geral",
  }[type] || type;
}

function translateStatus(status: string) {
  return {
    COMPLETED: "Concluído",
    GENERATING: "A gerar",
    FAILED: "Falhou",
  }[status] || status;
}
