"use client";
import { useModal, currentEntryStore } from "@/stores";
import { Icon, Button, DetailRow, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";

export function DetailsEntryModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentEntry } = currentEntryStore();

  if (!currentEntry || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="BookOpen" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentEntry.entry}</h2>
            <ItemStatusBadge status={currentEntry.approvalStatus} />
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
          <h3 className="font-semibold text-foreground border-b pb-2">Informações da Entrada</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="Entrada" value={currentEntry.entry} />
            <DetailRow label="Pronúncia" value={currentEntry.pronunciation || "—"} />
            <DetailRow label="Divisão Silábica" value={currentEntry.syllabicDivision || "—"} />
            <DetailRow label="Etimologia" value={currentEntry.etymology || "—"} />
            <DetailRow label="Definição 1" value={currentEntry.firstDefinition || "—"} />
            <DetailRow label="Definição 2" value={currentEntry.secondDefinition || "—"} />
            <DetailRow label="Definição 3" value={currentEntry.thirdDefinition || "—"} />
            <DetailRow label="Exemplo de Uso" value={currentEntry.usageExample || "—"} />
            <DetailRow label="Abreviatura" value={currentEntry.abbreviation || "—"} />
            <DetailRow label="Acrónimo" value={currentEntry.acronym || "—"} />
            <DetailRow label="Significado do Acrónimo" value={currentEntry.acronymMeaning || "—"} />
            <DetailRow label="Significado da Redução" value={currentEntry.reductionMeaning || "—"} />
            <DetailRow label="Forma Curta" value={currentEntry.shortForm || "—"} />
            <DetailRow label="Forma Completa" value={currentEntry.fullForm || "—"} />
            <DetailRow label="Código da Língua" value={currentEntry.languageCode || "—"} />
            <DetailRow label="É Vocabulário?" value={currentEntry.isVocabulary ? "Sim" : "Não"} />
            <DetailRow label="É Estrangeirismo?" value={currentEntry.isForeignism ? "Sim" : "Não"} />
          </div>
        </section>

        {(currentEntry.createdAt || currentEntry.updatedAt) && (
          <section className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentEntry.createdAt && (
                <DetailRow
                  label="Criado em"
                  value={formatDateTime(currentEntry.createdAt as string)}
                />
              )}
              {currentEntry.updatedAt && (
                <DetailRow
                  label="Actualizado em"
                  value={formatDateTime(currentEntry.updatedAt as string)}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
