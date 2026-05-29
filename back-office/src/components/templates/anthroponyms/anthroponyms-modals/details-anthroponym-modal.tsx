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

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="Users" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentAnthroponym.name}</h2>
            <ItemStatusBadge status={currentAnthroponym.approvalStatus} />
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
          <h3 className="font-semibold text-foreground border-b pb-2">Informações do Antropónimo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="Nome" value={currentAnthroponym.name} />
            <DetailRow label="Gênero" value={currentAnthroponym.gender || "—"} />
            <DetailRow label="Etimologia" value={currentAnthroponym.etymology || "—"} />
            <DetailRow label="Significado" value={currentAnthroponym.meaning || "—"} />
            <DetailRow label="Sobrenome" value={currentAnthroponym.surname || "—"} />
            <DetailRow label="Significado do Sobrenome" value={currentAnthroponym.surnameMeaning || "—"} />
            <DetailRow label="Figura Histórica" value={currentAnthroponym.historicalFigure || "—"} />
            <DetailRow label="Pseudônimo Histórico" value={currentAnthroponym.historicalFigurePseudonym || "—"} />
            <DetailRow label="Domínio Histórico" value={currentAnthroponym.historicalFigureDomain || "—"} />
            <DetailRow label="É Vocabulário?" value={currentAnthroponym.isVocabulary ? "Sim" : "Não"} />
            <DetailRow label="É Estrangeirismo?" value={currentAnthroponym.isForeignism ? "Sim" : "Não"} />
          </div>
        </section>

        {(currentAnthroponym.createdAt || currentAnthroponym.updatedAt) && (
          <section className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
