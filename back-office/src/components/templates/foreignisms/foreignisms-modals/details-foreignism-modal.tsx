"use client";
import { useModal, currentForeignismStore } from "@/stores";
import { Icon, Button, DetailRow, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";

export function DetailsForeignismModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentForeignism } = currentForeignismStore();

  if (!currentForeignism || !isOpen) return null;

  const sourceName =
    currentForeignism.firstSource ||
    currentForeignism.sourceDocument?.filename ||
    "Glossário de Estrangeirismos e Empréstimos (AO45)";
  const frequency = currentForeignism.frequency || 1;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="Globe" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-2 mt-4">
            <h2 className="text-2xl font-bold text-foreground">{currentForeignism.term}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ItemStatusBadge status={currentForeignism.approvalStatus} />
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
            <Icon name="Languages" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Informações Linguísticas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <DetailRow label="Vocábulo / Termo" value={currentForeignism.term} />
            <DetailRow label="Pronúncia" value={currentForeignism.pronunciation || "—"} />
            <DetailRow label="Língua Original" value={currentForeignism.originalLanguage || "—"} />
            <DetailRow label="País de Origem" value={currentForeignism.originCountry || "—"} />
            <DetailRow label="Forma Adaptada (AO45)" value={currentForeignism.adaptedForm || "—"} />
            <DetailRow label="Forma Original" value={currentForeignism.originalForm || "—"} />
            <DetailRow label="Categoria Gramatical" value={currentForeignism.grammaticalCategory || "—"} />
            <DetailRow label="Significado" value={currentForeignism.meaning || "—"} />
            <DetailRow label="Definição" value={currentForeignism.definition || "—"} />
            <DetailRow label="Contexto de Uso" value={currentForeignism.context || "—"} />
            <DetailRow label="Área de Conhecimento" value={currentForeignism.field || "—"} />
            <DetailRow label="Abreviatura" value={currentForeignism.abbreviation || "—"} />
            <DetailRow label="Acrónimo" value={currentForeignism.acronym || "—"} />
            <DetailRow label="Redução" value={currentForeignism.reduction || "—"} />
            <DetailRow label="Forma Curta" value={currentForeignism.shortForm || "—"} />
            <DetailRow label="Forma Completa" value={currentForeignism.fullForm || "—"} />
          </div>
        </section>

        {currentForeignism.usageExample && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <Icon name="Quote" className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Exemplo de Aplicação Prática</h3>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 italic text-foreground">
              «{currentForeignism.usageExample}»
            </div>
          </section>
        )}

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
              value={currentForeignism.sourceDocument?.category || "Acervo de Estrangeirismos"}
            />
            <DetailRow
              label="Frequência Registada"
              value={`${frequency} ${frequency === 1 ? "ocorrência" : "ocorrências"}`}
            />
            <DetailRow
              label="Lote de Processamento"
              value={currentForeignism.importBatchId || "Acervo MED"}
            />
          </div>
        </section>

        {(currentForeignism.createdAt || currentForeignism.updatedAt) && (
          <section className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 pb-1">
              <Icon name="Clock" className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-muted-foreground">Informações Técnicas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <DetailRow label="ID" value={currentForeignism.id} />
              {currentForeignism.createdAt && (
                <DetailRow
                  label="Criado em"
                  value={formatDateTime(currentForeignism.createdAt as string)}
                />
              )}
              {currentForeignism.updatedAt && (
                <DetailRow
                  label="Actualizado em"
                  value={formatDateTime(currentForeignism.updatedAt as string)}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
