"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button, DetailRow, GlobalModal, Icon } from "@/components";
import { useModal } from "@/stores";
import { AuditLogResponse } from "@/types";
import {
  buildAuditDescription,
  buildAuditTitle,
  getFriendlyChangedFields,
  translateAction,
  translateEntity,
  translateRole,
  translateStatus,
} from "./audit-log-translations";

export function DetailsAuditLogModal() {
  const { closeModal, modalData, open } = useModal();
  const log = modalData["AUDIT_LOG_DETAILS_MODAL"] as AuditLogResponse | undefined;
  const isOpen = open["AUDIT_LOG_DETAILS_MODAL"];

  if (!log || !isOpen) return null;

  const changedFields = getFriendlyChangedFields(log);

  return (
    <GlobalModal
      canClose
      id="AUDIT_LOG_DETAILS_MODAL"
      className="w-full max-w-3xl"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
            <Icon name="History" className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{buildAuditTitle(log)}</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex w-full justify-end">
          <Button variant="outline" onClick={() => closeModal("AUDIT_LOG_DETAILS_MODAL")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="rounded-lg border bg-card p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Descrição</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{buildAuditDescription(log)}</p>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <DetailRow label="Data" value={format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })} />
          <DetailRow label="Resultado" value={translateStatus(log.status)} />
          <DetailRow label="Ator" value={log.actor?.name || "Sistema"} />
          <DetailRow label="Função do ator" value={translateRole(log.actor?.role || log.actorRole)} />
          <DetailRow label="Acção" value={translateAction(log.action)} />
          <DetailRow label="Entidade" value={translateEntity(log.entity)} />
        </section>

        {log.failureReason && (
          <section className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <h3 className="mb-2 text-sm font-semibold text-destructive">Motivo da falha</h3>
            <p className="text-sm leading-6 text-foreground">{String(log.failureReason)}</p>
          </section>
        )}

        {changedFields.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Campos alterados</h3>
            <div className="flex flex-wrap gap-2">
              {changedFields.map((field) => (
                <Badge key={field} variant="secondary">{field}</Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
