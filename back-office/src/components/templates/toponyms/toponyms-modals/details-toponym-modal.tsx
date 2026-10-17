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

  const sourceName =
    currentToponym.firstSource ||
    currentToponym.sourceDocument?.filename ||
    "Atlas Toponímico Nacional de Angola (AO45)";
  const frequency = currentToponym.frequency || 1;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="MapPin" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-2 mt-4">
            <h2 className="text-2xl font-bold text-foreground">{currentToponym.toponym}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ItemStatusBadge status={currentToponym.approvalStatus} />
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
            <Icon name="Map" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Identificação Geográfica & Histórica</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <DetailRow label="Topónimo" value={currentToponym.toponym} />
            <DetailRow label="Pronúncia" value={currentToponym.pronunciation || "—"} />
            <DetailRow label="Gentílico" value={currentToponym.gentilic || "—"} />
            <DetailRow label="Província" value={currentToponym.province || "—"} />
            <DetailRow label="Município" value={currentToponym.municipality || "—"} />
            <DetailRow label="Localização / Comuna" value={currentToponym.location || "—"} />
            <DetailRow label="Significado" value={currentToponym.meaning || "—"} />
            <DetailRow label="História" value={currentToponym.toponymHistory || "—"} />
            <DetailRow label="Proveniência" value={currentToponym.toponymProvenance || "—"} />
            <DetailRow label="Uso Comum" value={currentToponym.commonUsage || "—"} />
            <DetailRow label="Variação Gráfica" value={currentToponym.graphicVariation || "—"} />
            <DetailRow label="Classes" value={currentToponym.toponymClasses?.join(", ") || "—"} />
            <DetailRow label="Subclasses" value={currentToponym.toponymSubclasses?.join(", ") || "—"} />
            <DetailRow label="Código da Língua" value={currentToponym.languageCode || "pt-AO"} />
            <DetailRow label="É Vocabulário (VONALP)?" value={currentToponym.isVocabulary ? "Sim" : "Não"} />
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
              value={currentToponym.sourceDocument?.category || "Divisão Político-Administrativa"}
            />
            <DetailRow
              label="Frequência Registada"
              value={`${frequency} ${frequency === 1 ? "ocorrência" : "ocorrências"}`}
            />
            <DetailRow
              label="Lote de Processamento"
              value={currentToponym.importBatchId || "Acervo Toponímico Nacional"}
            />
          </div>
        </section>

        {(currentToponym.createdAt || currentToponym.updatedAt) && (
          <section className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 pb-1">
              <Icon name="Clock" className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-muted-foreground">Informações Técnicas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <DetailRow label="ID" value={currentToponym.id} />
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
