"use client";
import { useModal, currentToponymStore } from "@/stores";
import { Icon, Button, DetailRow, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";

export function DetailsToponymModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentToponym } = currentToponymStore();

  if (!currentToponym || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="MapPin" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentToponym.toponym}</h2>
            <ItemStatusBadge status={currentToponym.approvalStatus} />
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
          <h3 className="font-semibold text-foreground border-b pb-2">Informações do Topónimo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="Topónimo" value={currentToponym.toponym} />
            <DetailRow label="Pronúncia" value={currentToponym.pronunciation || "—"} />
            <DetailRow label="Gentílico" value={currentToponym.gentilic || "—"} />
            <DetailRow label="Província" value={currentToponym.province || "—"} />
            <DetailRow label="Município" value={currentToponym.municipality || "—"} />
            <DetailRow label="Localização" value={currentToponym.location || "—"} />
            <DetailRow label="Significado" value={currentToponym.meaning || "—"} />
            <DetailRow label="História" value={currentToponym.toponymHistory || "—"} />
            <DetailRow label="Proveniência" value={currentToponym.toponymProvenance || "—"} />
            <DetailRow label="Uso Comum" value={currentToponym.commonUsage || "—"} />
            <DetailRow label="Variação Gráfica" value={currentToponym.graphicVariation || "—"} />
            <DetailRow label="Classes" value={currentToponym.toponymClasses?.join(", ") || "—"} />
            <DetailRow label="Subclasses" value={currentToponym.toponymSubclasses?.join(", ") || "—"} />
            <DetailRow label="Código da Língua" value={currentToponym.languageCode || "—"} />
            <DetailRow label="É Vocabulário?" value={currentToponym.isVocabulary ? "Sim" : "Não"} />
            <DetailRow label="É Estrangeirismo?" value={currentToponym.isForeignism ? "Sim" : "Não"} />
          </div>
        </section>

        {currentToponym.locationImage && (
          <section className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Imagem da Localização</h3>
            <div className="max-w-md">
              <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                <img 
                  src={currentToponym.locationImage} 
                  alt="Localização" 
                  className="object-cover w-full h-full"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            </div>
          </section>
        )}

        {(currentToponym.createdAt || currentToponym.updatedAt) && (
          <section className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentToponym.createdAt && (
                <DetailRow
                  label="Criado em"
                  value={formatDateTime(currentToponym.createdAt as string)}
                />
              )}
              {currentToponym.updatedAt && (
                <DetailRow
                  label="Actualizado em"
                  value={formatDateTime(currentToponym.updatedAt as string)}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
