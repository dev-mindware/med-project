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
              {entry.isSchoolManual && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  <Icon name="BookOpen" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Manual Escolar (MED / EP)
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Icon name="Activity" className="w-3.5 h-3.5" />
                {frequency} {frequency === 1 ? "ocorrência no acervo" : "ocorrências no acervo"}
              </span>
              {entry.datingYear && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Icon name="Calendar" className="w-3.5 h-3.5" />
                  Datação: {entry.datingYear}
                </span>
              )}
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
        {/* Banner de Manual Escolar quando aplicável */}
        {entry.isSchoolManual && (
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200">
            <Icon name="BookOpen" className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold block text-emerald-800 dark:text-emerald-300">
                Termo de Manual Escolar (Ensino Primário / MED)
              </span>
              Este vocábulo consta diretamente no acervo pedagógico homologado para os manuais escolares do Ensino Primário em Angola.
            </div>
          </div>
        )}

        {/* Ficha Lexicográfica Canónica — 13 Elementos Estipulados pela CN-IILP */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Icon name="Sparkles" className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Ficha Lexicográfica Canónica (CN-IILP)</h3>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Norma AO 1945 & Cunha & Cintra</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <DetailRow label="1. Vocábulo / Entrada" value={entry.entry} />
            <DetailRow label="2. Pronúncia / Acentuação" value={entry.pronunciation || "—"} />
            <DetailRow label="3. Divisão Silábica" value={entry.syllabicDivision || "—"} />
            <DetailRow label="4. Categoria Gramatical" value={entry.grammaticalCategory || "—"} />
            <DetailRow label="5. Subcategoria Gramatical" value={entry.grammaticalSubcategory || "—"} />
            <DetailRow label="7. Etimologia" value={entry.etymology || "—"} />
            <DetailRow
              label="8. Datação (1.ª Ocorrência no Corpus)"
              value={entry.datingYear ? `${entry.datingYear} (Frequência: ${frequency}×)` : `— (Frequência: ${frequency}×)`}
            />
            <DetailRow
              label="9. Estrangeirismo"
              value={entry.isForeignism ? "Sim (Vocábulo de empréstimo)" : "Não"}
            />
            <DetailRow
              label="10. Estrutura Gramatical"
              value={entry.grammaticalStructure || "palavra simples"}
            />
            <DetailRow label="11. Código da Língua" value={entry.languageCode || "pt-AO"} />
            <DetailRow label="12. Vocabulário Oficial (VONALP)" value={entry.isVocabulary ? "Sim" : "Não"} />
            <DetailRow label="13. Vocabulário Ensino Primário (VONALP-EP)" value={entry.isVocabularyEP ? "Sim" : "Não"} />
          </div>
        </section>

        {/* Elemento 6: Definições Lexicográficas com Exemplo Integrado em AZUL */}
        <section className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 pb-1">
            <Icon name="BookA" className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">6. Definições & Exemplo de Aplicação Contextual</h3>
          </div>
          <div className="space-y-2">
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60">
              <span className="text-xs font-semibold text-primary block mb-1">1.ª Definição (Principal):</span>
              <p className="text-foreground leading-relaxed">{entry.firstDefinition || "—"}</p>
            </div>
            {entry.secondDefinition && (
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">2.ª Definição:</span>
                <p className="text-foreground leading-relaxed">{entry.secondDefinition}</p>
              </div>
            )}
            {entry.thirdDefinition && (
              <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">3.ª Definição:</span>
                <p className="text-foreground leading-relaxed">{entry.thirdDefinition}</p>
              </div>
            )}
          </div>

          {/* Exemplo de Aplicação Contextualizada com Destaque Mandatório a AZUL */}
          {entry.usageExample && (
            <div className="mt-3 p-4 rounded-lg bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-blue-600 text-blue-950 dark:text-blue-100 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon name="Quote" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Exemplo de Aplicação Contextualizada no Corpus (Destaque Regulamentar Azul)
                </span>
              </div>
              <p className="italic font-medium leading-relaxed">«{entry.usageExample}»</p>
            </div>
          )}
        </section>

        {/* Remissões Lexicográficas */}
        {entry.isForeignism && (
          <section className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300 mb-1">
              <Icon name="ArrowRightLeft" className="w-4 h-4" />
              Remissão Lexicográfica: Estrangeirismo
            </div>
            <p className="text-amber-900 dark:text-amber-200">
              Este termo é um estrangeirismo/empréstimo lexical. As formas adaptadas e correspondentes vernáculos podem ser consultadas no módulo de Estrangeirismos.
            </p>
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
