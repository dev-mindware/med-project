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

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="Globe" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentForeignism.term}</h2>
            <ItemStatusBadge status={currentForeignism.approvalStatus} />
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
          <h3 className="font-semibold text-foreground border-b pb-2">Informações do Estrangeirismo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="Vocábulo" value={currentForeignism.term} />
            <DetailRow label="Pronúncia" value={currentForeignism.pronunciation || "—"} />
            <DetailRow label="Língua Original" value={currentForeignism.originalLanguage || "—"} />
            <DetailRow label="País de Origem" value={currentForeignism.originCountry || "—"} />
            <DetailRow label="Forma Adaptada" value={currentForeignism.adaptedForm || "—"} />
            <DetailRow label="Forma Original" value={currentForeignism.originalForm || "—"} />
            <DetailRow label="Significado" value={currentForeignism.meaning || "—"} />
            <DetailRow label="Definição" value={currentForeignism.definition || "—"} />
            <DetailRow label="Exemplo de Uso" value={currentForeignism.usageExample || "—"} />
            <DetailRow label="Contexto" value={currentForeignism.context || "—"} />
            <DetailRow label="Área de Conhecimento" value={currentForeignism.field || "—"} />
            <DetailRow label="Categoria Gramatical" value={currentForeignism.grammaticalCategory || "—"} />
            <DetailRow label="Abreviatura" value={currentForeignism.abbreviation || "—"} />
            <DetailRow label="Acrónimo" value={currentForeignism.acronym || "—"} />
            <DetailRow label="Redução" value={currentForeignism.reduction || "—"} />
            <DetailRow label="Forma Curta" value={currentForeignism.shortForm || "—"} />
            <DetailRow label="Forma Completa" value={currentForeignism.fullForm || "—"} />
          </div>
        </section>

        {(currentForeignism.createdAt || currentForeignism.updatedAt) && (
          <section className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
