"use client";
import { Button, DetailRow, GlobalModal, Icon } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { currentVolnaStore, useModal } from "@/stores";
import { formatDateTime } from "@/utils";

export function DetailsVolnaModal() {
  const { closeModal, open } = useModal();
  const { currentVolnaTerm } = currentVolnaStore();

  if (!currentVolnaTerm || !open["VOLNA_DETAILS_MODAL"]) return null;

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
            <h2 className="text-2xl font-bold">{currentVolnaTerm.term}</h2>
            <p className="text-sm text-muted-foreground">{currentVolnaTerm.language}</p>
          </div>
          <ItemStatusBadge status={currentVolnaTerm.approvalStatus} />
        </div>
      }
      footer={<Button variant="outline" onClick={() => closeModal("VOLNA_DETAILS_MODAL")}>Fechar</Button>}
    >
      <div className="space-y-6 text-sm">
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <DetailRow label="Vocábulo" value={currentVolnaTerm.term} />
          <DetailRow label="Língua nacional" value={currentVolnaTerm.language} />
          <DetailRow label="Classe gramatical" value={currentVolnaTerm.grammaticalCategory || "—"} />
          <DetailRow label="Subclasse gramatical" value={currentVolnaTerm.grammaticalSubcategory || "—"} />
        </section>
        <section className="space-y-3 border-t pt-4">
          <DetailRow label="Definição" value={currentVolnaTerm.definition} />
          <DetailRow label="Exemplo de uso" value={currentVolnaTerm.usageExample || "—"} />
          <DetailRow label="Notas" value={currentVolnaTerm.notes || "—"} />
        </section>
        <section className="grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-2">
          <DetailRow label="Criado em" value={formatDateTime(currentVolnaTerm.createdAt)} />
          <DetailRow label="Actualizado em" value={formatDateTime(currentVolnaTerm.updatedAt)} />
        </section>
      </div>
    </GlobalModal>
  );
}
