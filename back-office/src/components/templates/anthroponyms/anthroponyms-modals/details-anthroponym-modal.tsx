"use client";
import { useModal, currentAnthroponymStore } from "@/stores";
import { Icon, Button, DetailRow, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";

export function DetailsAnthroponymModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentAnthroponym } = currentAnthroponymStore();

  if (!currentAnthroponym || !isOpen) return null;

  const sourceName =
    currentAnthroponym.firstSource ||
    currentAnthroponym.sourceDocument?.filename ||
    "Onomástica e Antroponímia Angolana (AO45)";
  const frequency = currentAnthroponym.frequency || 1;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="Users" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-2 mt-4">
            <h2 className="text-2xl font-bold text-foreground">{currentAnthroponym.name}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ItemStatusBadge status={currentAnthroponym.approvalStatus} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Icon name="Activity" className="w-3.5 h-3.5" />
                {frequency} {frequency === 1 ? "ocorrência" : "ocorrências"}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 max-w-sm truncate"
                title={sourceName}
              >
                <Icon name="FileText" className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{sourceName}</span>
              </span>
            </div>
          </div>
        </>
      }
      className="w-full max-w-4xl"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={() => closeModal("DETAILS_MODAL")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Icon name="UserCheck" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Identificação Antroponímica</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <DetailRow label="Nome Próprio / Antropónimo" value={currentAnthroponym.name} />
            <DetailRow label="Gênero" value={currentAnthroponym.gender || "—"} />
            <DetailRow label="Etimologia / Origem" value={currentAnthroponym.etymology || "—"} />
            <DetailRow label="Significado Cultural" value={currentAnthroponym.meaning || "—"} />
            <DetailRow label="Sobrenome / Linhagem" value={currentAnthroponym.surname || "—"} />
            <DetailRow label="Significado do Sobrenome" value={currentAnthroponym.surnameMeaning || "—"} />
            <DetailRow label="Figura Histórica Associada" value={currentAnthroponym.historicalFigure || "—"} />
            <DetailRow label="Pseudónimo Histórico" value={currentAnthroponym.historicalFigurePseudonym || "—"} />
            <DetailRow label="Domínio Histórico / Relevância" value={currentAnthroponym.historicalFigureDomain || "—"} />
            <DetailRow label="É Vocabulário (VONALP)?" value={currentAnthroponym.isVocabulary ? "Sim" : "Não"} />
            <DetailRow label="É Estrangeirismo?" value={currentAnthroponym.isForeignism ? "Sim" : "Não"} />
          </div>
        </section>

        {/* Proveniência Documental */}
        <section className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 pb-1">
            <Icon name="FileCheck" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Proveniência & Evidência Documental</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <DetailRow label="Fonte / Documento" value={sourceName} />
            <DetailRow
              label="Categoria da Fonte"
              value={currentAnthroponym.sourceDocument?.category || "Acervo Antroponímico Nacional"}
            />
            <DetailRow
              label="Frequência Registada"
              value={`${frequency} ${frequency === 1 ? "ocorrência" : "ocorrências"}`}
            />
            <DetailRow
              label="Lote de Processamento"
              value={currentAnthroponym.importBatchId || "Acervo de Nomes Nacionais"}
            />
          </div>
        </section>

        {(currentAnthroponym.createdAt || currentAnthroponym.updatedAt) && (
          <section className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 pb-1">
              <Icon name="Clock" className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-muted-foreground">Informações Técnicas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <DetailRow label="ID" value={currentAnthroponym.id} />
              {currentAnthroponym.createdAt && (
                <DetailRow
                  label="Criado em"
                  value={formatDateTime(currentAnthroponym.createdAt as string)}
                />
              )}
              {currentAnthroponym.updatedAt && (
                <DetailRow
                  label="Actualizado em"
                  value={formatDateTime(currentAnthroponym.updatedAt as string)}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
