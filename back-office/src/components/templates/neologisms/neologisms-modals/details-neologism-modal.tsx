"use client";
import { Button, DetailRow, GlobalModal, Icon } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { currentNeologismStore, useModal } from "@/stores";
import { formatDateTime } from "@/utils/format-date";

export function DetailsNeologismModal() {
  const { closeModal, open } = useModal();
  const { currentNeologism } = currentNeologismStore();

  if (!currentNeologism || !open["NEOLOGISM_DETAILS_MODAL"]) return null;

  return (
    <GlobalModal
      canClose
      id="NEOLOGISM_DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="BookOpen" className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentNeologism.entry}</h2>
            <ItemStatusBadge status={currentNeologism.approvalStatus} />
          </div>
        </>
      }
      className="w-full max-w-4xl"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={() => closeModal("NEOLOGISM_DETAILS_MODAL")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground border-b pb-2">Informações do Neologismo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="Neologismo" value={currentNeologism.entry} />
            <DetailRow label="Pronúncia" value={currentNeologism.pronunciation || "—"} />
            <DetailRow label="Divisão Silábica" value={currentNeologism.syllabicDivision || "—"} />
            <DetailRow label="Etimologia" value={currentNeologism.etymology || "—"} />
            <DetailRow label="Definição 1" value={currentNeologism.firstDefinition || "—"} />
            <DetailRow label="Definição 2" value={currentNeologism.secondDefinition || "—"} />
            <DetailRow label="Definição 3" value={currentNeologism.thirdDefinition || "—"} />
            <DetailRow label="Exemplo de Uso" value={currentNeologism.usageExample || "—"} />
            <DetailRow label="Categoria Gramatical" value={currentNeologism.grammaticalCategory || "—"} />
            <DetailRow label="Subcategoria" value={currentNeologism.grammaticalSubcategory || "—"} />
            <DetailRow label="Código da Língua" value={currentNeologism.languageCode || "—"} />
            <DetailRow label="É VONALP?" value={currentNeologism.isVocabulary ? "Sim" : "Não"} />
            <DetailRow label="É VONALP-EP?" value={currentNeologism.isVocabularyEP ? "Sim" : "Não"} />
            <DetailRow label="É Estrangeirismo?" value={currentNeologism.isForeignism ? "Sim" : "Não"} />
          </div>
        </section>

        <section className="space-y-2 border-t pt-4">
          <h3 className="font-semibold text-foreground">Informações Técnicas</h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Criado em" value={formatDateTime(currentNeologism.createdAt)} />
            <DetailRow label="Actualizado em" value={formatDateTime(currentNeologism.updatedAt)} />
          </div>
        </section>
      </div>
    </GlobalModal>
  );
}
