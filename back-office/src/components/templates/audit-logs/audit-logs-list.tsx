"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/common";
import { useAuditLogsFilters } from "@/hooks/audit-logs-filters";
import { AuditLogResponse } from "@/types";
import { useModal } from "@/stores";
import { auditLogsService } from "@/services/audit-logs-service";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import {
  ButtonOnlyAction,
  ListPageSkeleton,
  GenericTable,
  Column,
  RequestError,
  EmptyState,
  TitleList,
} from "@/components/common";
import { AuditLogsFilters } from "./common/audit-logs-filters";
import {
  buildAuditDescription,
  translateAction,
  translateEntity,
  translateStatus,
} from "./audit-log-translations";

export function AuditLogsList() {
  const { filters, page, setPage } = useAuditLogsFilters();
  const { openModal } = useModal();

  const {
    data,
    totalPages,
    total,
    isLoading,
    isError,
    refetch,
    goToNextPage,
    goToPreviousPage,
  } = usePagination<AuditLogResponse>({
    endpoint: "/audit-logs",
    queryKey: ["audit-logs", filters],
    queryParams: {
      ...filters,
      page,
    },
  });

  const downloadAuditReport = async (period: "daily" | "monthly" | "annual") => {
    try {
      const response = await auditLogsService.downloadPdfReport(period);
      const disposition = response.headers["content-disposition"] as string | undefined;
      const filename = disposition?.match(/filename=([^;]+)/)?.[1]?.replaceAll('"', "") || `audit_logs_${period}.pdf`;
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      SucessMessage("Relatório de auditoria gerado com sucesso");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Não foi possível gerar o relatório de auditoria");
    }
  };

  const columns: Column<AuditLogResponse>[] = [
    {
      key: "actor",
      header: "Ator",
      render: (_, log) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{log.actor?.name || "Sistema"}</span>
          <span className="text-xs text-muted-foreground">{log.actor?.email || ""}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, log) => (
        <Badge variant={getActionVariant(log.action)}>
          {translateAction(log.action)}
        </Badge>
      ),
    },
    {
      key: "entity",
      header: "Entidade",
      render: (_, log) => (
        <span className="text-sm font-medium">{translateEntity(log.entity)}</span>
      ),
    },
    {
      key: "description",
      header: "Descrição",
      render: (_, log) => (
        <span className="line-clamp-2 text-sm text-muted-foreground">
          {buildAuditDescription(log)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, log) => (
        <Badge variant={log.status === "FAILED" ? "destructive" : "success"}>
          {translateStatus(log.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Data",
      render: (_, log) => (
        <span className="text-sm">
          {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[70px]",
      render: (_, log) => (
        <ButtonOnlyAction
          data={log}
          actions={[
            {
              label: "Ver detalhes",
              icon: "Eye",
              onClick: (item) => openModal("AUDIT_LOG_DETAILS_MODAL", item),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading) {
    return <ListPageSkeleton cols={7} rows={10} showAction />;
  }

  if (isError) {
    return <RequestError refetch={refetch} message="Erro ao carregar os logs de auditoria" />;
  }

  return (
    <div className="mt-6 space-y-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <TitleList
          title="Logs de Auditoria"
          suTitle="Acompanhe as actividades e alterações realizadas no sistema"
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => downloadAuditReport("daily")}>Relatório diário</Button>
          <Button variant="outline" onClick={() => downloadAuditReport("monthly")}>Relatório mensal</Button>
          <Button variant="outline" onClick={() => downloadAuditReport("annual")}>Relatório anual</Button>
        </div>
      </div>

      <AuditLogsFilters />

      {data.length > 0 ? (
        <GenericTable<AuditLogResponse>
          data={data}
          columns={columns}
          total={total}
          totalPages={totalPages}
          page={page}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum log de auditoria encontrado."
        />
      ) : (
        <EmptyState
          title="Nenhum log encontrado"
          description="Não existem registos de auditoria para os filtros selecionados."
          icon="History"
        />
      )}
    </div>
  );
}

function getActionVariant(action: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "pending" {
  const a = action.toUpperCase();
  if (a.includes("CREATE")) return "success";
  if (a.includes("UPDATE")) return "warning";
  if (a.includes("DELETE")) return "destructive";
  if (a.includes("LOGIN")) return "default";
  return "outline";
}
