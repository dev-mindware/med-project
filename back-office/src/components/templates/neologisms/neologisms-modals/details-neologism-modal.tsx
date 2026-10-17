"use client";
import { Button, DetailRow, GlobalModal, Icon } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { currentNeologismStore, useModal } from "@/stores";
import { formatDateTime } from "@/utils/format-date";

export function DetailsNeologismModal() {
  const { closeModal, open } = useModal();
  const { currentNeologism } = currentNeologismStore();

  if (!currentNeologism || !open["NEOLOGISM_DETAILS_MODAL"]) return null;

  const sourceName =
    currentNeologism.firstSource ||
    currentNeologism.sourceDocument?.filename ||
    "Acervo Lexicográfico MED (AO45)";
  const frequency = currentNeologism.frequency || 1;

  return (
    <GlobalModal
      canClose
      id="NEOLOGISM_DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="BookOpen" className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center space-y-2 mt-4">
            <h2 className="text-2xl font-bold text-foreground">{currentNeologism.entry}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ItemStatusBadge status={currentNeologism.approvalStatus} />
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
          <Button variant="outline" onClick={() => closeModal("NEOLOGISM_DETAILS_MODAL")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Icon name="Sparkles" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Classificação & Linguística</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <DetailRow label="Neologismo" value={currentNeologism.entry} />
            <DetailRow label="Categoria Gramatical" value={currentNeologism.grammaticalCategory || "—"} />
            <DetailRow label="Subcategoria" value={currentNeologism.grammaticalSubcategory || "—"} />
            <DetailRow label="Pronúncia" value={currentNeologism.pronunciation || "—"} />
            <DetailRow label="Divisão Silábica" value={currentNeologism.syllabicDivision || "—"} />
            <DetailRow label="Etimologia / Origem" value={currentNeologism.etymology || "—"} />
            <DetailRow label="Código da Língua" value={currentNeologism.languageCode || "pt-AO"} />
            <DetailRow label="É VONALP?" value={currentNeologism.isVocabulary ? "Sim" : "Não"} />
            <DetailRow label="É VONALP-EP?" value={currentNeologism.isVocabularyEP ? "Sim" : "Não"} />
            <DetailRow label="É Estrangeirismo?" value={currentNeologism.isForeignism ? "Sim" : "Não"} />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <Icon name="BookA" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Definições</h3>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
              <span className="text-xs font-semibold text-primary block mb-1">1ª Definição:</span>
              <p className="text-foreground leading-relaxed">{currentNeologism.firstDefinition || "—"}</p>
            </div>
            {currentNeologism.secondDefinition && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">2ª Definição:</span>
                <p className="text-foreground leading-relaxed">{currentNeologism.secondDefinition}</p>
              </div>
            )}
            {currentNeologism.thirdDefinition && (
              <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">3ª Definição:</span>
                <p className="text-foreground leading-relaxed">{currentNeologism.thirdDefinition}</p>
              </div>
            )}
          </div>
        </section>

        {currentNeologism.usageExample && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <Icon name="Quote" className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Exemplo de Uso</h3>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 italic text-foreground">
              «{currentNeologism.usageExample}»
            </div>
          </section>
        )}

        <section className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 pb-1">
            <Icon name="FileCheck" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Proveniência & Evidência Documental</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <DetailRow label="Documento Fonte" value={sourceName} />
            <DetailRow
              label="Categoria da Fonte"
              value={currentNeologism.sourceDocument?.category || "Acervo MED"}
            />
            <DetailRow
              label="Frequência Registada"
              value={`${frequency} ${frequency === 1 ? "ocorrência" : "ocorrências"}`}
            />
            <DetailRow
              label="Lote de Processamento"
              value={currentNeologism.importBatchId || "Acervo MED"}
            />
          </div>
        </section>

        <section className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2 pb-1">
            <Icon name="Clock" className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">Informações Técnicas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <DetailRow label="ID" value={currentNeologism.id} />
            <DetailRow label="Criado em" value={formatDateTime(currentNeologism.createdAt)} />
            <DetailRow label="Actualizado em" value={formatDateTime(currentNeologism.updatedAt)} />
          </div>
        </section>
      </div>
    </GlobalModal>
  );
}
