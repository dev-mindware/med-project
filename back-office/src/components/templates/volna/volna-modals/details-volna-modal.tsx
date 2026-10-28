"use client";
import { Button, DetailRow, GlobalModal, Icon } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { currentVolnaStore, useModal } from "@/stores";
import { formatDateTime } from "@/utils";

export function DetailsVolnaModal() {
  const { closeModal, open } = useModal();
  const { currentVolnaTerm } = currentVolnaStore();

  if (!currentVolnaTerm || !open["VOLNA_DETAILS_MODAL"]) return null;

  const sourceName =
    currentVolnaTerm.firstSource ||
    currentVolnaTerm.sourceDocument?.filename ||
    "VOLNA - Vocabulário Ortográfico de Línguas Nacionais de Angola";
  const frequency = currentVolnaTerm.frequency || 1;

  return (
    <GlobalModal
      id="VOLNA_DETAILS_MODAL"
      canClose
      className="w-full max-w-3xl"
      title={
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-primary/10">
            <Icon name="Languages" className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{currentVolnaTerm.term}</h2>
            <p className="text-sm font-medium text-primary">{currentVolnaTerm.language}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ItemStatusBadge status={currentVolnaTerm.approvalStatus} />
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
      }
      footer={<Button variant="outline" onClick={() => closeModal("VOLNA_DETAILS_MODAL")}>Fechar</Button>}
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <Icon name="Sparkles" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Classificação Linguística & Língua Nacional</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailRow label="Vocábulo" value={currentVolnaTerm.term} />
            <DetailRow label="Língua nacional de Angola" value={currentVolnaTerm.language} />
            <DetailRow label="Classe gramatical" value={currentVolnaTerm.grammaticalCategory || "—"} />
            <DetailRow label="Subclasse gramatical" value={currentVolnaTerm.grammaticalSubcategory || "—"} />
          </div>
        </section>

        <section className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 pb-1">
            <Icon name="BookA" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Definição & Semântica</h3>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <p className="text-foreground leading-relaxed">{currentVolnaTerm.definition}</p>
          </div>
          {currentVolnaTerm.usageExample && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 italic text-foreground">
              «{currentVolnaTerm.usageExample}»
            </div>
          )}
          {currentVolnaTerm.notes && (
            <DetailRow label="Notas culturais / etnográficas" value={currentVolnaTerm.notes} />
          )}
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
              value={currentVolnaTerm.sourceDocument?.category || "Acervo de Línguas Nacionais (VOLNA)"}
            />
            <DetailRow
              label="Frequência Registada"
              value={`${frequency} ${frequency === 1 ? "ocorrência" : "ocorrências"}`}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-2 text-xs">
          <DetailRow label="Criado em" value={formatDateTime(currentVolnaTerm.createdAt)} />
          <DetailRow label="Actualizado em" value={formatDateTime(currentVolnaTerm.updatedAt)} />
        </section>
      </div>
    </GlobalModal>
  );
}
