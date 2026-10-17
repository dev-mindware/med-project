"use client";
import { useModal, currentEntryStore } from "@/stores";
import { Icon, Button, DetailRow, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";
import { useFetch } from "@/hooks/common/use-fetch";
import { EntryResponse } from "@/types";

export function DetailsEntryModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentEntry } = currentEntryStore();

  const { data: fullEntry, isLoading } = useFetch<EntryResponse>(
    ["entry-details", currentEntry?.id || ""],
    `/entries/${currentEntry?.id}`,
    { enabled: isOpen && !!currentEntry?.id }
  );

  if (!currentEntry || !isOpen) return null;

  const entry = fullEntry || currentEntry;
  const sourceName =
    entry.firstSource ||
    entry.sourceDocument?.filename ||
    "Dicionário Lexicográfico Geral (AO45)";
  const frequency = entry.frequency || 1;

  const hasMorphology =
    entry.abbreviation ||
    entry.acronym ||
    entry.acronymMeaning ||
    entry.reduction ||
    entry.reductionMeaning ||
    entry.shortForm ||
    entry.fullForm;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="BookOpen" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-2 mt-4">
            <h2 className="text-2xl font-bold text-foreground">{entry.entry}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ItemStatusBadge status={entry.approvalStatus} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Icon name="Activity" className="w-3.5 h-3.5" />
                {frequency} {frequency === 1 ? "ocorrência no acervo" : "ocorrências no acervo"}
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
        {/* Seção 1: Classificação Gramatical e Fonológica */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Icon name="Sparkles" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Classificação Gramatical & Fonologia</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <DetailRow label="Vocábulo / Entrada" value={entry.entry} />
            <DetailRow label="Categoria Gramatical" value={entry.grammaticalCategory || "—"} />
            <DetailRow label="Subcategoria Gramatical" value={entry.grammaticalSubcategory || "—"} />
            <DetailRow label="Estatuto Gramatical" value={entry.grammaticalStatus || "padrão AO45"} />
            <DetailRow label="Divisão Silábica" value={entry.syllabicDivision || "—"} />
            <DetailRow label="Pronúncia / Acentuação" value={entry.pronunciation || "—"} />
            <DetailRow label="Etimologia" value={entry.etymology || "—"} />
            <DetailRow label="Código da Língua" value={entry.languageCode || "pt-AO"} />
            <DetailRow label="Vocabulário Oficial (VONALP)" value={entry.isVocabulary ? "Sim" : "Não"} />
            <DetailRow label="Vocabulário Escolar (VONALP-EP)" value={entry.isVocabularyEP ? "Sim" : "Não"} />
            <DetailRow label="Estrangeirismo" value={entry.isForeignism ? "Sim" : "Não"} />
          </div>
        </section>

        {/* Seção 2: Definições Lexicográficas */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <Icon name="BookA" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Definições Lexicográficas</h3>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
              <span className="text-xs font-semibold text-primary block mb-1">1ª Definição:</span>
              <p className="text-foreground leading-relaxed">{entry.firstDefinition || "—"}</p>
            </div>
            {entry.secondDefinition && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">2ª Definição:</span>
                <p className="text-foreground leading-relaxed">{entry.secondDefinition}</p>
              </div>
            )}
            {entry.thirdDefinition && (
              <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">3ª Definição:</span>
                <p className="text-foreground leading-relaxed">{entry.thirdDefinition}</p>
              </div>
            )}
          </div>
        </section>

        {/* Seção 3: Exemplo de Uso Contextualizado */}
        {entry.usageExample && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <Icon name="Quote" className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Exemplo de Aplicação Contextual</h3>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 italic text-foreground">
              «{entry.usageExample}»
            </div>
          </section>
        )}

        {/* Seção 4: Proveniência Documental & Ocorrências no Corpus */}
        <section className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 pb-1">
            <Icon name="FileCheck" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Proveniência & Evidência Documental</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <DetailRow label="Fonte Principal / Documento" value={sourceName} />
            <DetailRow
              label="Categoria da Fonte"
              value={entry.sourceDocument?.category || "Manuais e Acervo MED"}
            />
            <DetailRow
              label="Frequência no Corpus"
              value={`${frequency} ${frequency === 1 ? "ocorrência registada" : "ocorrências registadas"}`}
            />
            <DetailRow
              label="Lote de Processamento"
              value={entry.importBatchId || "Acervo de Vocabulário MED"}
            />
          </div>

          {/* Ocorrências adicionais em múltiplos documentos */}
          {entry.occurrences && entry.occurrences.length > 0 && (
            <div className="mt-3 pt-3 border-t border-dashed">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Ocorrências Mapeadas no Acervo ({entry.occurrences.length} documentos):
              </h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {entry.occurrences.map((occ, idx) => (
                  <div
                    key={occ.id || idx}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/40 border border-border/50"
                  >
                    <span className="truncate max-w-md font-medium text-foreground" title={occ.filename}>
                      📄 {occ.filename}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px] shrink-0">
                      {occ.count} {occ.count === 1 ? "vez" : "vezes"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Seção 5: Formas Morfológicas & Siglas */}
        {hasMorphology && (
          <section className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2 pb-1">
              <Icon name="Layers" className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Morfologia & Formas Abreviadas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
              <DetailRow label="Abreviatura" value={entry.abbreviation || "—"} />
              <DetailRow label="Acrónimo" value={entry.acronym || "—"} />
              <DetailRow label="Significado do Acrónimo" value={entry.acronymMeaning || "—"} />
              <DetailRow label="Redução" value={entry.reduction || "—"} />
              <DetailRow label="Significado da Redução" value={entry.reductionMeaning || "—"} />
              <DetailRow label="Forma Curta" value={entry.shortForm || "—"} />
              <DetailRow label="Forma Completa" value={entry.fullForm || "—"} />
            </div>
          </section>
        )}

        {/* Seção 6: Auditoria & Informações Técnicas */}
        {(entry.createdAt || entry.updatedAt || entry.id) && (
          <section className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 pb-1">
              <Icon name="Clock" className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-muted-foreground">Metadados de Auditoria</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <DetailRow label="Identificador Único (ID)" value={entry.id} />
              {entry.createdAt && (
                <DetailRow
                  label="Criado em"
                  value={formatDateTime(entry.createdAt as string)}
                />
              )}
              {entry.updatedAt && (
                <DetailRow
                  label="Actualizado em"
                  value={formatDateTime(entry.updatedAt as string)}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
