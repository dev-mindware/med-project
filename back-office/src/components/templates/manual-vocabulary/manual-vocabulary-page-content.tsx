"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Icon, TitleList } from "@/components/common";
import {
  useAuth,
  useCommitManualVocabularyToDatabase,
  useExportExcelManualVocabulary,
  useExtractManualVocabularyPreview,
  useImportExcelManualVocabulary,
  useManualVocabularyLogs,
} from "@/hooks";
import {
  ExtractionProgress as ExtractionProgressState,
  ManualExtractionLogItem,
  ManualVocabularyCommitResult,
  ManualVocabularyModule,
  ManualVocabularySourceModel,
  ManualVocabularyWorkbookData,
} from "@/types";
import { cn } from "@/lib/utils";
import { ensurePtAO, MODULE_FIELDS, type FieldDef } from "./manual-vocabulary-fields";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const MAX_PDF_SIZE = 100 * 1024 * 1024;
const MAX_EXCEL_SIZE = 50 * 1024 * 1024;

interface ModuleOption {
  id: ManualVocabularySourceModel;
  label: string;
  shortDesc: string;
  examples: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  link: string;
}

const AVAILABLE_MODULES: ModuleOption[] = [
  {
    id: "ENTRY",
    label: "Entradas & Verbetes",
    shortDesc: "Palavras simples, compostos hifenizados, espécies botânicas e locuções.",
    examples: "couve-flor, musseque, água, fim de semana",
    icon: "BookOpen",
    link: "/entries",
  },
  {
    id: "NEOLOGISM",
    label: "Neologismos",
    shortDesc: "Criações lexicais recentes, gírias contemporâneas e inovações de Angola.",
    examples: "kixikila, bazar, cota moderno, tuga",
    icon: "Sparkles",
    link: "/neologisms",
  },
  {
    id: "TOPONYM",
    label: "Topónimos",
    shortDesc: "Províncias, cidades, municípios, comunas, rios e acidentes geográficos.",
    examples: "Luanda, Benguela, Kwanza, Cazenga",
    icon: "MapPin",
    link: "/toponyms",
  },
  {
    id: "ANTHROPONYM",
    label: "Antropónimos",
    shortDesc: "Nomes próprios angolanos, patronímicos, apelidos e figuras históricas.",
    examples: "Njinga Mbandi, Agostinho Neto, Mukenga",
    icon: "UserCheck",
    link: "/anthroponyms",
  },
  {
    id: "FOREIGNISM",
    label: "Estrangeirismos",
    shortDesc: "Empréstimos linguísticos estrangeiros, adaptados ou não ao português.",
    examples: "online, software, boutique, workshop",
    icon: "Globe",
    link: "/foreignisms",
  },
];

function reclassifyItem(
  item: Record<string, any>,
  target: ManualVocabularySourceModel,
): Record<string, any> {
  const baseTerm = String(
    item.entry || item.toponym || item.name || item.term || "",
  ).trim();

  const common = {
    isVocabulary: item.isVocabulary ?? false,
    isVocabularyEP: item.isVocabularyEP ?? false,
    isForeignism: target === "FOREIGNISM" ? true : (item.isForeignism ?? false),
    confidence: item.confidence ?? 1,
    pronunciation: item.pronunciation || null,
    usageExample: item.usageExample || null,
    languageCode: item.languageCode || "pt-AO",
  };

  switch (target) {
    case "ENTRY":
      return {
        ...common,
        entry: baseTerm,
        wordType: item.wordType || "simples",
        firstDefinition:
          item.firstDefinition || item.meaning || item.definition || "Definição a completar",
        secondDefinition: item.secondDefinition || null,
        thirdDefinition: item.thirdDefinition || null,
        syllabicDivision: item.syllabicDivision || null,
        etymology: item.etymology || null,
        grammaticalCategory: item.grammaticalCategory || null,
        grammaticalSubcategory: item.grammaticalSubcategory || null,
        grammaticalStatus: item.grammaticalStatus || null,
      };

    case "NEOLOGISM":
      return {
        ...common,
        entry: baseTerm,
        wordType: item.wordType || "simples",
        firstDefinition:
          item.firstDefinition ||
          item.meaning ||
          item.definition ||
          "Definição do neologismo a completar",
        secondDefinition: item.secondDefinition || null,
        thirdDefinition: item.thirdDefinition || null,
        syllabicDivision: item.syllabicDivision || null,
        etymology: item.etymology || null,
        grammaticalCategory: item.grammaticalCategory || null,
        grammaticalSubcategory: item.grammaticalSubcategory || null,
        grammaticalStatus: item.grammaticalStatus || null,
      };

    case "TOPONYM":
      return {
        ...common,
        toponym: baseTerm,
        province: item.province || "Angola",
        municipality: item.municipality || null,
        location: item.location || null,
        meaning: item.meaning || item.firstDefinition || item.definition || null,
        gentilic: item.gentilic || null,
        toponymHistory: item.toponymHistory || null,
        toponymProvenance: item.toponymProvenance || null,
        commonUsage: item.commonUsage || null,
        graphicVariation: item.graphicVariation || null,
        toponymClasses: item.toponymClasses || [],
        toponymSubclasses: item.toponymSubclasses || [],
      };

    case "ANTHROPONYM":
      return {
        ...common,
        name: baseTerm,
        gender: item.gender || "M",
        meaning: item.meaning || item.firstDefinition || item.definition || null,
        etymology: item.etymology || null,
        surname: item.surname || null,
        surnameMeaning: item.surnameMeaning || null,
        historicalFigure: item.historicalFigure || null,
        historicalFigurePseudonym: item.historicalFigurePseudonym || null,
        historicalFigureDomain: item.historicalFigureDomain || null,
      };

    case "FOREIGNISM":
      return {
        ...common,
        term: baseTerm,
        integrationLevel: item.integrationLevel || "adaptado",
        definition: item.definition || item.firstDefinition || item.meaning || null,
        meaning: item.meaning || item.firstDefinition || item.definition || null,
        originalLanguage: item.originalLanguage || "Inglês",
        originCountry: item.originCountry || null,
        adaptedForm: item.adaptedForm || null,
        originalForm: item.originalForm || null,
        context: item.context || null,
        field: item.field || null,
        grammaticalCategory: item.grammaticalCategory || null,
      };
  }
}

/**
 * Chamadas de atenção da curadoria: campos que a IA preencheu sem base segura
 * no texto (ex: conjugação de verbos, pronúncia, etimologia) ou que ficaram em falta.
 */
function getAttention(
  module: ManualVocabularyModule,
  row: Record<string, any>,
): string[] {
  const out: string[] = [];
  const has = (k: string) => String(row[k] ?? "").trim().length > 0;
  const confidence = Number(row.confidence ?? 1);

  if (confidence < 0.7) out.push("Confiança baixa: confirme se o vocábulo e a classificação estão certos.");

  if (module === "ENTRY" || module === "NEOLOGISM") {
    if (!has("firstDefinition")) out.push("Definição em falta: escreva a acepção a partir do texto.");
    if (String(row.grammaticalCategory ?? "").toLowerCase() === "verbo") {
      out.push(
        "Verbo: as conjugações são geradas automaticamente a partir do infinitivo. Confirme as formas irregulares.",
      );
    }
    if (!has("grammaticalCategory")) out.push("Categoria gramatical não identificada.");
    if (has("pronunciation") || has("etymology")) {
      out.push("Pronúncia/etimologia inferidas pela IA, não vêm do texto: confirme antes de gravar.");
    }
  }

  if (module === "TOPONYM" && !has("province")) {
    out.push("Província não identificada no texto: indique a província ou país.");
  }
  if (module === "ANTHROPONYM" && !has("gender")) {
    out.push("Género não identificado: preencha apenas se for claro no texto.");
  }
  if (module === "FOREIGNISM" && (!has("originalLanguage") || !has("meaning"))) {
    out.push("Língua de origem ou significado em falta: confirme antes de gravar.");
  }
  if (module === "NATIONAL_LANGUAGE") {
    if (!has("definition")) out.push("Definição em falta: preencha a partir de uma fonte fiável.");
    if (row.verified !== true) {
      out.push("Significado não confirmado na web: confirme numa fonte fiável antes de gravar.");
    }
  }
  return out;
}

/** Campos do registo que originaram uma chamada de atenção (para os realçar no formulário). */
function getFlaggedFields(module: ManualVocabularyModule, row: Record<string, any>): Set<string> {
  const flagged = new Set<string>();
  const has = (k: string) => String(row[k] ?? "").trim().length > 0;
  if (module === "ENTRY" || module === "NEOLOGISM") {
    if (!has("firstDefinition")) flagged.add("firstDefinition");
    if (!has("grammaticalCategory") || String(row.grammaticalCategory).toLowerCase() === "verbo") {
      flagged.add("grammaticalCategory");
    }
    if (has("pronunciation")) flagged.add("pronunciation");
    if (has("etymology")) flagged.add("etymology");
  }
  if (module === "TOPONYM" && !has("province")) flagged.add("province");
  if (module === "ANTHROPONYM" && !has("gender")) flagged.add("gender");
  if (module === "FOREIGNISM") {
    if (!has("originalLanguage")) flagged.add("originalLanguage");
    if (!has("meaning")) flagged.add("meaning");
  }
  if (module === "NATIONAL_LANGUAGE" && (!has("definition") || row.verified !== true)) {
    flagged.add("definition");
  }
  return flagged;
}

/** Campo do formulário de edição, com ajuda e realce quando precisa de revisão. */
function FieldInput({
  def,
  value,
  flagged,
}: {
  def: FieldDef;
  value: any;
  flagged: boolean;
}) {
  const tone = flagged ? "border-amber-500 focus-visible:ring-amber-500/40" : "";
  const empty = value === undefined || value === null || value === "";
  return (
    <div className={cn(def.wide && "col-span-2")}>
      {def.kind === "boolean" ? (
        <label className="flex cursor-pointer items-center gap-2 pt-5 text-xs font-semibold text-foreground">
          <input
            type="checkbox"
            name={def.key}
            defaultChecked={Boolean(value)}
            className="h-4 w-4 rounded border-gray-300"
          />
          {def.label}
        </label>
      ) : (
        <>
          <label className="text-xs font-semibold text-foreground">
            {def.label}
            {def.required && <span className="text-destructive"> *</span>}
          </label>
          {def.kind === "textarea" ? (
            <textarea
              name={def.key}
              defaultValue={value ?? ""}
              rows={2}
              className={cn(
                "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                tone,
              )}
            />
          ) : def.kind === "select" ? (
            <select
              name={def.key}
              defaultValue={value ?? def.options?.[0] ?? ""}
              className={cn(
                "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                tone,
              )}
            >
              {empty && !def.options?.includes("") && <option value="">—</option>}
              {value && !def.options?.includes(value) && <option value={value}>{value}</option>}
              {def.options?.map((o) => (
                <option key={o} value={o}>
                  {o || "—"}
                </option>
              ))}
            </select>
          ) : (
            <Input
              name={def.key}
              type={def.kind === "number" ? "number" : "text"}
              min={def.kind === "number" ? 1 : undefined}
              defaultValue={
                def.kind === "list" && Array.isArray(value) ? value.join("; ") : (value ?? "")
              }
              required={def.required}
              className={cn("mt-1", tone)}
            />
          )}
          {def.hint && (
            <p className={cn("mt-1 text-[11px] leading-snug", flagged ? "text-amber-700" : "text-muted-foreground")}>
              {def.hint}
            </p>
          )}
        </>
      )}
    </div>
  );
}

const STAGE_ORDER = ["queued", "reading", "extracting", "processing", "verifying", "done"];

const STAGE_STEPS: { id: string; label: string; unit?: string }[] = [
  { id: "reading", label: "A ler o PDF" },
  { id: "extracting", label: "A identificar e classificar vocábulos", unit: "blocos" },
  { id: "processing", label: "A validar e contar frequências" },
  { id: "verifying", label: "A confirmar vocábulos das línguas nacionais na web", unit: "vocábulos" },
];

/** Percentagem global a partir da etapa real e das unidades concluídas nessa etapa. */
function overallPercent(p: ExtractionProgressState): number {
  const frac = p.total > 0 ? Math.min(1, p.done / p.total) : 0;
  switch (p.stage) {
    case "queued":
      return 1;
    case "reading":
      return 3;
    case "extracting":
      return 5 + frac * 70;
    case "processing":
      return 76;
    case "verifying":
      return 80 + frac * 18;
    default:
      return 100;
  }
}

/** Feedback visual durante a extracção, alimentado pelo progresso real do servidor. */
function ExtractionProgress({ progress }: { progress: ExtractionProgressState }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const current = STAGE_ORDER.indexOf(progress.stage);
  const percent = Math.round(overallPercent(progress));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4"
    >
      <style>{`
        @keyframes mv-shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
      `}</style>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">A extrair vocabulário · {percent}%</span>
        <span className="font-mono text-xs text-muted-foreground">
          {mm}:{ss}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 w-1/5 rounded-full bg-white/40"
          style={{ animation: "mv-shine 1.6s ease-in-out infinite" }}
        />
      </div>
      <ul className="space-y-1.5 text-xs">
        {STAGE_STEPS.map((step) => {
          const idx = STAGE_ORDER.indexOf(step.id);
          const state = idx < current ? "done" : idx === current ? "active" : "pending";
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-2",
                state === "pending" ? "text-muted-foreground/60" : "text-foreground",
              )}
            >
              {state === "done" ? (
                <Icon name="CircleCheck" className="h-3.5 w-3.5 text-emerald-500" />
              ) : state === "active" ? (
                <Icon name="Loader" className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <span className="ml-1 mr-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              )}
              <span>{step.label}</span>
              {state === "active" && step.unit && progress.total > 0 && (
                <span className="font-mono text-muted-foreground">
                  {progress.done}/{progress.total} {step.unit}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Manuais grandes podem demorar vários minutos. Pode limitar o intervalo de páginas para acelerar.
      </p>
    </div>
  );
}

export function ManualVocabularyPageContent() {
  const [activeTab, setActiveTab] = useState<string>("extract");
  const [file, setFile] = useState<File | null>(null);
  const [selectedModules, setSelectedModules] = useState<ManualVocabularySourceModel[]>([
    "ENTRY",
    "NEOLOGISM",
    "TOPONYM",
    "ANTHROPONYM",
    "FOREIGNISM",
  ]);
  const [startPage, setStartPage] = useState<string>("");
  const [endPage, setEndPage] = useState<string>("");

  // Staging / Curadoria State
  const [stagingData, setStagingData] = useState<ManualVocabularyWorkbookData | null>(null);
  const [sourceFilename, setSourceFilename] = useState<string>("");
  const [activeStagingTab, setActiveStagingTab] = useState<string>("ENTRY");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyAttention, setOnlyAttention] = useState<boolean>(false);
  const [progress, setProgress] = useState<ExtractionProgressState | null>(null);
  const [editingItem, setEditingItem] = useState<{
    module: ManualVocabularyModule;
    index: number;
    data: Record<string, any>;
  } | null>(null);

  // Database Commit & Duplicates State
  const [commitDialogOpen, setCommitDialogOpen] = useState<boolean>(false);
  const [commitResult, setCommitResult] = useState<ManualVocabularyCommitResult | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState<boolean>(false);

  // RBAC & Auth Context
  const { user } = useAuth();
  const isOperator = user?.role === "OPERATOR";
  const isSupervisor = user?.role === "SUPERVISOR";
  const isAdmin = user?.role === "ADMIN";
  const [directApproval, setDirectApproval] = useState<boolean>(false);

  // Mutations & Queries
  const extractPreview = useExtractManualVocabularyPreview();
  const importExcel = useImportExcelManualVocabulary();
  const exportExcel = useExportExcelManualVocabulary();
  const commitToDb = useCommitManualVocabularyToDatabase();

  const { data: logsData, isLoading: isLoadingLogs } = useManualVocabularyLogs({
    skip: 0,
    take: 20,
  });

  // ─── Dropzones ─────────────────────────────────────────────────────────────

  const onDropPdf = useCallback((acceptedFiles: File[]) => {
    const nextFile = acceptedFiles[0];
    if (!nextFile) return;

    if (nextFile.type !== "application/pdf") {
      ErrorMessage("Seleccione um ficheiro PDF.");
      return;
    }

    const maxAllowedSize = isOperator ? 25 * 1024 * 1024 : MAX_PDF_SIZE;
    if (nextFile.size > maxAllowedSize) {
      ErrorMessage(
        isOperator
          ? "Operadores têm um limite de 25MB por manual. Para ficheiros maiores, contacte o seu supervisor."
          : "O ficheiro excede o limite de 100MB.",
      );
      return;
    }

    setFile(nextFile);
  }, []);

  const {
    getRootProps: getPdfRootProps,
    getInputProps: getPdfInputProps,
    isDragActive: isPdfDragActive,
  } = useDropzone({
    onDrop: onDropPdf,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_PDF_SIZE,
    multiple: false,
    disabled: extractPreview.isPending,
  });

  const onDropExcel = useCallback(
    async (acceptedFiles: File[]) => {
      const nextFile = acceptedFiles[0];
      if (!nextFile) return;

      if (!nextFile.name.toLowerCase().endsWith(".xlsx")) {
        ErrorMessage("Seleccione um ficheiro Excel (.xlsx) válido.");
        return;
      }

      if (nextFile.size > MAX_EXCEL_SIZE) {
        ErrorMessage("O ficheiro Excel excede o limite de 50MB.");
        return;
      }

      try {
        const result = await importExcel.mutateAsync(nextFile);
        setStagingData(result.workbookData);
        setSourceFilename(result.filename || nextFile.name);
        setActiveTab("staging");
        SucessMessage(
          `Folha Excel importada e validada! ${result.stats.totalTerms} vocábulos carregados para curadoria.`,
        );
      } catch (err: any) {
        ErrorMessage(
          err?.response?.data?.message || err.message || "Erro ao importar a folha Excel.",
        );
      }
    },
    [importExcel],
  );

  const {
    getRootProps: getExcelRootProps,
    getInputProps: getExcelInputProps,
    isDragActive: isExcelDragActive,
  } = useDropzone({
    onDrop: onDropExcel,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: MAX_EXCEL_SIZE,
    multiple: false,
    disabled: importExcel.isPending,
  });

  // ─── Module Selection Helpers ──────────────────────────────────────────────

  const toggleModule = (moduleId: ManualVocabularySourceModel) => {
    if (extractPreview.isPending) return;
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const selectAllModules = () => {
    if (extractPreview.isPending) return;
    setSelectedModules(AVAILABLE_MODULES.map((m) => m.id));
  };

  const clearAllModules = () => {
    if (extractPreview.isPending) return;
    setSelectedModules([]);
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleExtract = async () => {
    if (!file) {
      ErrorMessage("Seleccione um PDF antes de processar.");
      return;
    }

    if (selectedModules.length === 0) {
      ErrorMessage("Seleccione pelo menos um módulo para extrair.");
      return;
    }

    const parsedStart = startPage.trim() ? parseInt(startPage.trim(), 10) : undefined;
    const parsedEnd = endPage.trim() ? parseInt(endPage.trim(), 10) : undefined;

    if (isOperator && parsedStart && parsedEnd && parsedEnd - parsedStart + 1 > 30) {
      ErrorMessage("Operadores podem extrair no máximo 30 páginas por operação.");
      return;
    }

    setProgress({ stage: "queued", done: 0, total: 0 });
    try {
      const result = await extractPreview.mutateAsync({
        file,
        modules: selectedModules,
        startPage: parsedStart,
        endPage: parsedEnd,
        onProgress: setProgress,
      });

      setStagingData(result.workbookData);
      setSourceFilename(file.name);
      setActiveTab("staging");
      SucessMessage(
        `Extracção concluída! ${result.stats.totalTerms} vocábulos carregados para curadoria.`,
      );
    } catch (error: any) {
      let message =
        "Não foi possível processar o manual. Verifique os parâmetros ou a ligação à API.";
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      ErrorMessage(message);
    } finally {
      setProgress(null);
    }
  };

  const handleExportExcel = async () => {
    if (!stagingData) return;
    try {
      await exportExcel.mutateAsync({
        workbookData: stagingData,
        filename: `vocabulario_curado_${Date.now()}.xlsx`,
      });
      SucessMessage("Folha de cálculo Excel gerada e descarregada com sucesso!");
    } catch {
      ErrorMessage("Falha ao exportar a folha Excel.");
    }
  };

  const handleCommitToDatabase = async () => {
    if (!stagingData) return;
    try {
      const shouldApproveDirectly = Boolean((isSupervisor || isAdmin) && directApproval);
      const result = await commitToDb.mutateAsync({
        entries: stagingData.entries,
        neologisms: stagingData.neologisms,
        toponyms: stagingData.toponyms,
        anthroponyms: stagingData.anthroponyms,
        foreignisms: stagingData.foreignisms,
        nationalLanguages: stagingData.nationalLanguages,
        directApproval: shouldApproveDirectly,
      });

      setCommitResult(result);
      setCommitDialogOpen(false);
      setResultDialogOpen(true);

      if (result.insertedCount > 0) {
        if (shouldApproveDirectly) {
          SucessMessage(
            `${result.insertedCount} novos registos foram aprovados e gravados diretamente na base de dados!`,
          );
        } else if (isOperator) {
          SucessMessage(
            `${result.insertedCount} registos foram submetidos como rascunhos para validação do seu supervisor!`,
          );
        } else {
          SucessMessage(
            `${result.insertedCount} novos registos foram inseridos na base de dados (em estado Rascunho/DRAFT)!`,
          );
        }
      }
      if (result.frequencyUpdatedCount > 0) {
        SucessMessage(
          `${result.frequencyUpdatedCount} vocábulos já existentes tiveram a frequência somada.`,
        );
      }
      const ignored = result.duplicatesCount - (result.frequencyUpdatedCount ?? 0);
      if (ignored > 0) {
        ErrorMessage(`${ignored} registos repetidos foram ignorados.`);
      }
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
          error.message ||
          "Falha ao gravar os registos na base de dados.",
      );
    }
  };

  // ─── Staging Mutations (Inline Edit, Reclassify, Delete) ─────────────────────

  const handleReclassify = (
    fromModule: ManualVocabularySourceModel,
    index: number,
    toModule: ManualVocabularySourceModel,
  ) => {
    if (!stagingData || fromModule === toModule) return;

    const sourceKey = getModuleDataKey(fromModule);
    const targetKey = getModuleDataKey(toModule);

    const sourceList = [...stagingData[sourceKey]];
    const targetList = [...stagingData[targetKey]];

    const [itemToMove] = sourceList.splice(index, 1);
    if (!itemToMove) return;

    const transformedItem = reclassifyItem(itemToMove, toModule);
    targetList.push(transformedItem);

    const updatedData: ManualVocabularyWorkbookData = {
      ...stagingData,
      [sourceKey]: sourceList,
      [targetKey]: targetList,
      stats: {
        ...stagingData.stats,
        entries: sourceKey === "entries" ? sourceList.length : targetKey === "entries" ? targetList.length : stagingData.stats.entries,
        neologisms: sourceKey === "neologisms" ? sourceList.length : targetKey === "neologisms" ? targetList.length : stagingData.stats.neologisms,
        toponyms: sourceKey === "toponyms" ? sourceList.length : targetKey === "toponyms" ? targetList.length : stagingData.stats.toponyms,
        anthroponyms: sourceKey === "anthroponyms" ? sourceList.length : targetKey === "anthroponyms" ? targetList.length : stagingData.stats.anthroponyms,
        foreignisms: sourceKey === "foreignisms" ? sourceList.length : targetKey === "foreignisms" ? targetList.length : stagingData.stats.foreignisms,
      },
    };

    setStagingData(updatedData);
    SucessMessage(
      `"${transformedItem.entry || transformedItem.name || transformedItem.toponym || transformedItem.term}" reclassificado para ${getModuleLabel(toModule)}!`,
    );
  };

  const handleDeleteItem = (module: ManualVocabularyModule, index: number) => {
    if (!stagingData) return;
    const key = getModuleDataKey(module);
    const list = [...stagingData[key]];
    const [deleted] = list.splice(index, 1);
    if (!deleted) return;

    const termLabel =
      deleted.entry || deleted.name || deleted.toponym || deleted.term || "Item";

    const updatedData: ManualVocabularyWorkbookData = {
      ...stagingData,
      [key]: list,
      stats: {
        ...stagingData.stats,
        totalTerms: stagingData.stats.totalTerms - 1,
        validRows: stagingData.stats.validRows - 1,
        [key]: list.length,
      },
    };

    setStagingData(updatedData);
    SucessMessage(`"${termLabel}" removido da curadoria.`);
  };

  const handleSaveEditedItem = (editedData: Record<string, any>) => {
    if (!stagingData || !editingItem) return;
    const key = getModuleDataKey(editingItem.module);
    const list = [...stagingData[key]];
    list[editingItem.index] = { ...list[editingItem.index], ...editedData };

    setStagingData({
      ...stagingData,
      [key]: list,
    });

    setEditingItem(null);
    SucessMessage("Alterações gravadas na curadoria!");
  };

  // Helper mappings
  function getModuleDataKey(
    mod: ManualVocabularyModule,
  ): "entries" | "neologisms" | "toponyms" | "anthroponyms" | "foreignisms" | "nationalLanguages" {
    switch (mod) {
      case "NATIONAL_LANGUAGE":
        return "nationalLanguages";
      case "ENTRY":
        return "entries";
      case "NEOLOGISM":
        return "neologisms";
      case "TOPONYM":
        return "toponyms";
      case "ANTHROPONYM":
        return "anthroponyms";
      case "FOREIGNISM":
        return "foreignisms";
    }
  }

  function getModuleLabel(mod: ManualVocabularyModule): string {
    switch (mod) {
      case "NATIONAL_LANGUAGE":
        return "Língua nacional";
      case "ENTRY":
        return "Entrada";
      case "NEOLOGISM":
        return "Neologismo";
      case "TOPONYM":
        return "Topónimo";
      case "ANTHROPONYM":
        return "Antropónimo";
      case "FOREIGNISM":
        return "Estrangeirismo";
    }
  }

  const attentionCount = useMemo(() => {
    if (!stagingData) return 0;
    return (
      ["ENTRY", "NEOLOGISM", "TOPONYM", "ANTHROPONYM", "FOREIGNISM", "NATIONAL_LANGUAGE"] as ManualVocabularyModule[]
    ).reduce(
      (sum, m) =>
        sum +
        (stagingData[getModuleDataKey(m)] ?? []).filter((r) => getAttention(m, r).length > 0).length,
      0,
    );
  }, [stagingData]);

  // Filtered rows for current staging tab
  const currentStagingRows = useMemo(() => {
    if (!stagingData) return [];
    if (activeStagingTab === "WARNINGS") return [];

    const mod = activeStagingTab as ManualVocabularyModule;
    const key = getModuleDataKey(mod);
    let list = ((stagingData[key] as Record<string, any>[] | undefined) || []).map((item, index) => ({ item, index }));

    if (onlyAttention) list = list.filter(({ item }) => getAttention(mod, item).length > 0);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();

    return list.filter(({ item }) => {
      const term = String(
        item.entry || item.toponym || item.name || item.term || "",
      ).toLowerCase();
      const def = String(
        item.firstDefinition || item.meaning || item.definition || "",
      ).toLowerCase();
      const province = String(item.province || "").toLowerCase();
      return term.includes(q) || def.includes(q) || province.includes(q);
    });
  }, [stagingData, activeStagingTab, searchQuery, onlyAttention]);

  return (
    <div className="mt-6 space-y-6">
      <TitleList title="Extracção Lexical" suTitle="" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="extract" >
            Extracção
          </TabsTrigger>
          <TabsTrigger value="staging" className="flex items-center gap-2 relative">
            Curadoria
            {stagingData && (
              <Badge variant="default" className="ml-1.5 px-1.5 py-0 text-[10px] h-4">
                {stagingData.stats.totalTerms}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: EXTRACÇÃO ─────────────────────────────────────────────── */}
        <TabsContent value="extract" className="mx-auto max-w-2xl space-y-5">
          <div
            {...getPdfRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
              isPdfDragActive || file
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              extractPreview.isPending && "pointer-events-none opacity-60",
            )}
          >
            <input {...getPdfInputProps()} />
            <Icon name="Upload" className="h-5 w-5 text-muted-foreground" />
            {file ? (
              <p className="mt-2 text-sm font-medium">
                {file.name}{" "}
                <span className="font-normal text-muted-foreground">· {formatSize(file.size)}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Arraste um PDF ou clique para seleccionar
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_MODULES.map((mod) => {
              const isChecked = selectedModules.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  title={`${mod.shortDesc} — ${mod.examples}`}
                  onClick={() => toggleModule(mod.id)}
                  disabled={extractPreview.isPending}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    isChecked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {mod.label}
                </button>
              );
            })}
          </div>

          {extractPreview.isPending && <ExtractionProgress progress={progress ?? { stage: "queued", done: 0, total: 0 }} />}

          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="number"
              min={1}
              placeholder="Pág. inicial"
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              disabled={extractPreview.isPending}
              className="h-9 w-28 text-xs"
            />
            <Input
              type="number"
              min={1}
              placeholder="Pág. final"
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              disabled={extractPreview.isPending}
              className="h-9 w-28 text-xs"
            />
            {isOperator && (
              <span className="text-xs text-muted-foreground">máx. 30 págs · 25MB</span>
            )}
            <Button
              type="button"
              onClick={handleExtract}
              loading={extractPreview.isPending}
              disabled={!file || extractPreview.isPending || selectedModules.length === 0}
              className="ml-auto"
            >
              {extractPreview.isPending ? "A processar..." : "Extrair"}
            </Button>
          </div>

          <div
            {...getExcelRootProps()}
            className={cn(
              "cursor-pointer text-center text-xs text-muted-foreground underline-offset-4 hover:underline",
              importExcel.isPending && "pointer-events-none opacity-60",
            )}
          >
            <input {...getExcelInputProps()} />
            {importExcel.isPending ? "A importar..." : "ou importar um ficheiro Excel (.xlsx)"}
          </div>
        </TabsContent>


        {/* ─── TAB 2: CURADORIA & VALIDAÇÃO (STAGING) ───────────────────────── */}
        <TabsContent value="staging" className="space-y-6">
          {!stagingData ? (
            <Card className="rounded-lg border-border p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon name="FileSpreadsheet" className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Nenhum documento em curadoria</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Extraia um PDF ou importe um Excel (.xlsx) para começar.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("extract")}
                  className="mt-2"
                >
                  <Icon name="Upload" className="h-4 w-4" />
                  Ir para Extracção
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* BARRA SUPERIOR DE ACÇÕES DA CURADORIA */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {sourceFilename}
                    </Badge>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 font-medium text-xs">
                      {stagingData.stats.totalTerms} itens em curadoria
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                    loading={exportExcel.isPending}
                    className="flex items-center gap-2"
                  >
                    <Icon name="FileSpreadsheet" className="h-4 w-4 text-emerald-600" />
                    Exportar Excel (.xlsx)
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setCommitDialogOpen(true)}
                    loading={commitToDb.isPending}
                    className="flex items-center gap-2"
                  >
                    <Icon name={isOperator ? "Send" : "Database"} className="h-4 w-4" />
                    {isOperator ? "Submeter para Revisão" : "Salvar na Base de Dados"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStagingData(null);
                      setFile(null);
                      setActiveTab("extract");
                    }}
                    title="Limpar e carregar novo documento"
                  >
                    <Icon name="RotateCcw" className="h-4 w-4" />
                  </Button>
                </div>
              </div>


              {/* TABS DAS TABELAS POR MÓDULO */}
              <Card className="rounded-lg border-border">
                <CardHeader className="pb-3 border-b border-border/60">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs
                      value={activeStagingTab}
                      onValueChange={setActiveStagingTab}
                      className="w-full sm:w-auto"
                    >
                      <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1">
                        <TabsTrigger value="ENTRY" className="text-xs">
                          Entradas ({stagingData.entries.length})
                        </TabsTrigger>
                        <TabsTrigger value="NEOLOGISM" className="text-xs">
                          Neologismos ({stagingData.neologisms.length})
                        </TabsTrigger>
                        <TabsTrigger value="TOPONYM" className="text-xs">
                          Topónimos ({stagingData.toponyms.length})
                        </TabsTrigger>
                        <TabsTrigger value="ANTHROPONYM" className="text-xs">
                          Antropónimos ({stagingData.anthroponyms.length})
                        </TabsTrigger>
                        <TabsTrigger value="FOREIGNISM" className="text-xs">
                          Estrangeirismos ({stagingData.foreignisms.length})
                        </TabsTrigger>
                        <TabsTrigger value="NATIONAL_LANGUAGE" className="text-xs">
                          Línguas nacionais ({stagingData.nationalLanguages?.length ?? 0})
                        </TabsTrigger>
                        {stagingData.warnings.length > 0 && (
                          <TabsTrigger value="WARNINGS" className="text-xs text-amber-600">
                            Avisos ({stagingData.warnings.length})
                          </TabsTrigger>
                        )}
                      </TabsList>
                    </Tabs>

                    {/* CAMPO DE PESQUISA RÁPIDA */}
                    {activeStagingTab !== "WARNINGS" && (
                      <div className="flex w-full items-center gap-2 sm:w-auto">
                        {attentionCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setOnlyAttention((v) => !v)}
                            className={cn(
                              "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                              onlyAttention
                                ? "border-amber-500 bg-amber-500/15 text-amber-700"
                                : "border-border text-muted-foreground hover:border-amber-500/50",
                            )}
                          >
                            <Icon name="TriangleAlert" className="h-3 w-3" />
                            {attentionCount} a rever
                          </button>
                        )}
                        <Input
                          type="search"
                          placeholder="Pesquisar..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 w-full text-xs sm:w-52"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* TABELA: AVISOS */}
                  {activeStagingTab === "WARNINGS" ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-24">Módulo</TableHead>
                            <TableHead className="w-20">Linha</TableHead>
                            <TableHead className="w-32">Vocábulo</TableHead>
                            <TableHead className="w-32">Campo</TableHead>
                            <TableHead>Mensagem de Advertência</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stagingData.warnings.map((w, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px]">
                                  {w.sourceModel}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{w.rowNumber}</TableCell>
                              <TableCell className="font-semibold text-xs">{w.term || "—"}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{w.field || "—"}</TableCell>
                              <TableCell className="text-xs text-amber-600 font-medium">
                                {w.message}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    /* TABELA DO MÓDULO ACTUAL */
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="min-w-[200px]">Vocábulo</TableHead>
                            <TableHead className="min-w-[260px]">Definição</TableHead>
                            <TableHead className="w-40">Classe</TableHead>
                            <TableHead className="w-14 text-right">Freq.</TableHead>
                            <TableHead className="w-16 text-right">Conf.</TableHead>
                            <TableHead className="w-28" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentStagingRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                                Nenhum registo encontrado.
                              </TableCell>
                            </TableRow>
                          ) : (
                            currentStagingRows.map(({ item: row, index: idx }) => {
                              const mod = activeStagingTab as ManualVocabularyModule;
                              const term =
                                row.entry || row.toponym || row.name || row.term || "Sem título";
                              const definition =
                                row.firstDefinition || row.meaning || row.definition || "—";
                              const confidence = Number(row.confidence ?? 1);
                              const attention = getAttention(mod, row);
                              const kind =
                                mod === "NATIONAL_LANGUAGE"
                                  ? [row.language, row.grammaticalCategory].filter(Boolean).join(" · ")
                                  : mod === "TOPONYM"
                                  ? [row.province, row.municipality].filter(Boolean).join(" · ")
                                  : mod === "ANTHROPONYM"
                                    ? [row.gender, row.surname].filter(Boolean).join(" · ")
                                    : mod === "FOREIGNISM"
                                      ? [row.originalLanguage, row.integrationLevel]
                                          .filter(Boolean)
                                          .join(" · ")
                                      : [row.wordType, row.grammaticalCategory]
                                          .filter(Boolean)
                                          .join(" · ");

                              return (
                                <TableRow key={idx} className="group align-top hover:bg-muted/20">
                                  <TableCell className="text-sm font-medium text-foreground">
                                    <div className="flex items-start gap-1.5">
                                      {attention.length > 0 && (
                                        <span title={attention.join("\n")} className="mt-0.5 shrink-0">
                                          <Icon name="TriangleAlert" className="h-3.5 w-3.5 text-amber-500" />
                                        </span>
                                      )}
                                      <span>{term}</span>
                                    </div>
                                    {attention.length > 0 && (
                                      <p className="mt-1 max-w-xs whitespace-normal text-[11px] font-normal leading-snug text-amber-700">
                                        {attention[0]}
                                        {attention.length > 1 && ` (+${attention.length - 1})`}
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-md whitespace-normal text-xs text-muted-foreground">
                                    <span className="line-clamp-2">{definition}</span>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{kind || "—"}</TableCell>
                                  <TableCell className="text-right font-mono text-xs">
                                    {row.frequency ?? 1}
                                  </TableCell>
                                  <TableCell
                                    className={cn(
                                      "text-right font-mono text-xs",
                                      confidence >= 0.8
                                        ? "text-emerald-600"
                                        : confidence >= 0.6
                                          ? "text-amber-600"
                                          : "text-destructive",
                                    )}
                                  >
                                    {(confidence * 100).toFixed(0)}%
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        title="Editar"
                                        onClick={() =>
                                          setEditingItem({ module: mod, index: idx, data: { ...row } })
                                        }
                                      >
                                        <Icon name="Pencil" className="h-3.5 w-3.5" />
                                      </Button>
                                      {mod !== "NATIONAL_LANGUAGE" && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            title="Mover para outro módulo"
                                          >
                                            <Icon name="RefreshCw" className="h-3.5 w-3.5" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                          {AVAILABLE_MODULES.filter((m) => m.id !== mod).map((m) => (
                                            <DropdownMenuItem
                                              key={m.id}
                                              onClick={() =>
                                                handleReclassify(mod as ManualVocabularySourceModel, idx, m.id)
                                              }
                                              className="cursor-pointer text-xs"
                                            >
                                              {m.label}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                      )}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                        title="Eliminar"
                                        onClick={() => handleDeleteItem(mod, idx)}
                                      >
                                        <Icon name="Trash2" className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 3: HISTÓRICO DE AUDITORIA ───────────────────────────────── */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="rounded-lg border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">Extracções recentes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                  A carregar histórico...
                </div>
              ) : !logsData?.items?.length ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                  Nenhum registo de auditoria encontrado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ficheiro</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Entradas</TableHead>
                        <TableHead className="text-center">Neologismos</TableHead>
                        <TableHead className="text-center">Topónimos</TableHead>
                        <TableHead className="text-center">Tempo</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsData.items.map((log: ManualExtractionLogItem) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium text-xs">
                            <div className="flex items-center gap-1.5">
                              <Icon name="FileText" className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[160px]">{log.filename}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatSize(log.fileSize)}
                          </TableCell>
                          <TableCell className="text-center font-semibold">{log.totalTerms}</TableCell>
                          <TableCell className="text-center text-xs">{log.entries}</TableCell>
                          <TableCell className="text-center text-xs">{log.neologisms}</TableCell>
                          <TableCell className="text-center text-xs">{log.toponyms}</TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {(log.processingMs / 1000).toFixed(1)}s
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString("pt-PT")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── MODAL DE EDIÇÃO DE REGISTO ───────────────────────────────────────── */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="Pencil" className="h-4 w-4 text-primary" />
                Editar {getModuleLabel(editingItem.module)}
              </DialogTitle>
            </DialogHeader>

            {getAttention(editingItem.module, editingItem.data).length > 0 && (
              <div className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Icon name="TriangleAlert" className="h-3.5 w-3.5" />
                  A rever
                </p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {getAttention(editingItem.module, editingItem.data).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const edited: Record<string, any> = {};
                for (const f of MODULE_FIELDS[editingItem.module]) {
                  const val = formData.get(f.key);
                  if (f.kind === "boolean") edited[f.key] = val === "on";
                  else if (f.kind === "list")
                    edited[f.key] = String(val ?? "")
                      .split(/[;,]/)
                      .map((x) => x.trim())
                      .filter(Boolean);
                  else if (f.kind === "number")
                    edited[f.key] = Math.max(1, parseInt(String(val || "1"), 10) || 1);
                  else edited[f.key] = String(val ?? "").trim();
                }
                if ("languageCode" in edited) edited.languageCode = ensurePtAO(edited.languageCode);
                handleSaveEditedItem(edited);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {MODULE_FIELDS[editingItem.module].map((def) => (
                  <FieldInput
                    key={def.key}
                    def={def}
                    value={editingItem.data[def.key]}
                    flagged={getFlaggedFields(editingItem.module, editingItem.data).has(def.key)}
                  />
                ))}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Gravar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── MODAL DE CONFIRMAÇÃO DE SALVAGUARDA NA BD ───────────────────────── */}
      <Dialog open={commitDialogOpen} onOpenChange={setCommitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name={isOperator ? "Send" : "Database"} className="h-5 w-5 text-primary" />
              {isOperator ? "Submeter para revisão" : "Salvar na base de dados"}
            </DialogTitle>
            <DialogDescription>
              {isOperator
                ? "Os vocábulos serão gravados como Rascunho para revisão do seu supervisor."
                : "Vocábulos já existentes não são duplicados: a frequência é somada à do registo existente."}
            </DialogDescription>
          </DialogHeader>

          {stagingData && (
            <div className="space-y-3 py-2 text-sm text-muted-foreground">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-border p-3 text-xs">
                <span>Entradas: {stagingData.entries.length}</span>
                <span>Neologismos: {stagingData.neologisms.length}</span>
                <span>Topónimos: {stagingData.toponyms.length}</span>
                <span>Antropónimos: {stagingData.anthroponyms.length}</span>
                <span>Estrangeirismos: {stagingData.foreignisms.length}</span>
                <span>Línguas nacionais: {stagingData.nationalLanguages?.length ?? 0}</span>
                <span className="font-semibold text-foreground">Total: {stagingData.stats.totalTerms}</span>
              </div>
              {attentionCount > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-amber-700">
                  <Icon name="TriangleAlert" className="h-3.5 w-3.5" />
                  {attentionCount} registo(s) ainda marcados para rever.
                </p>
              )}

              {/* Opção de Aprovação Direta para Supervisor e Admin vs Alerta de Submissão de Operador */}
              {isSupervisor || isAdmin ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={directApproval}
                      onChange={(e) => setDirectApproval(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    Aprovar directamente (caso contrário, grava como Rascunho)
                  </label>
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCommitDialogOpen(false)}
              disabled={commitToDb.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              loading={commitToDb.isPending}
              onClick={handleCommitToDatabase}
              className="flex items-center gap-2"
            >
              <Icon name={isOperator ? "Send" : "Check"} className="h-4 w-4" />
              {isOperator
                ? "Submeter para Revisão"
                : directApproval
                  ? "Aprovar & Salvar Tudo"
                  : "Confirmar & Salvar como Rascunhos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL DE RESULTADO DA IMPORTAÇÃO NA BD ─────────────────────────── */}
      {commitResult && (
        <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="CircleCheck" className="h-5 w-5 text-emerald-500" />
                Gravação concluída
              </DialogTitle>
              <DialogDescription>
                Gravação concluída.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <p className="text-xs text-emerald-700 font-semibold uppercase">Inseridos na BD</p>
                  <p className="text-3xl font-bold text-emerald-700 mt-1">
                    {commitResult.insertedCount}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Criados como Rascunho (DRAFT)</p>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs text-amber-700 font-semibold uppercase">Já existentes</p>
                  <p className="text-3xl font-bold text-amber-700 mt-1">
                    {commitResult.duplicatesCount}
                  </p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Frequência somada: {commitResult.frequencyUpdatedCount ?? 0}</p>
                </div>
              </div>

              {/* Detalhe por módulo */}
              <div className="rounded-lg border border-border p-3 text-xs space-y-1.5">
                <p className="font-semibold text-foreground">Detalhamento por Módulo:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                  <div>
                    Entradas:{" "}
                    <span className="font-semibold text-foreground">
                      {commitResult.details.entries.inserted} inseridas
                    </span>{" "}
                    ({commitResult.details.entries.duplicates} duplicadas)
                  </div>
                  <div>
                    Neologismos:{" "}
                    <span className="font-semibold text-foreground">
                      {commitResult.details.neologisms.inserted} inseridas
                    </span>{" "}
                    ({commitResult.details.neologisms.duplicates} duplicadas)
                  </div>
                  <div>
                    Topónimos:{" "}
                    <span className="font-semibold text-foreground">
                      {commitResult.details.toponyms.inserted} inseridas
                    </span>{" "}
                    ({commitResult.details.toponyms.duplicates} duplicadas)
                  </div>
                  <div>
                    Antropónimos:{" "}
                    <span className="font-semibold text-foreground">
                      {commitResult.details.anthroponyms.inserted} inseridas
                    </span>{" "}
                    ({commitResult.details.anthroponyms.duplicates} duplicadas)
                  </div>
                  <div>
                    Línguas nacionais:{" "}
                    <span className="font-semibold text-foreground">
                      {commitResult.details.nationalLanguages?.inserted ?? 0} inseridas
                    </span>{" "}
                    ({commitResult.details.nationalLanguages?.duplicates ?? 0} existentes)
                  </div>
                  <div>
                    Estrangeirismos:{" "}
                    <span className="font-semibold text-foreground">
                      {commitResult.details.foreignisms.inserted} inseridas
                    </span>{" "}
                    ({commitResult.details.foreignisms.duplicates} duplicadas)
                  </div>
                </div>
              </div>

              {/* Lista de duplicados ignorados com motivo */}
              {commitResult.skippedDuplicates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    Vocábulos já existentes ({commitResult.skippedDuplicates.length}):
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-2 space-y-1 bg-muted/20 text-xs">
                    {commitResult.skippedDuplicates.map((dup, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 border-b border-border/40 pb-1 last:border-0 last:pb-0"
                      >
                        <span className="font-semibold text-foreground">{dup.term}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {dup.module}
                          </Badge>
                          <span className="text-muted-foreground text-[11px]">{dup.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:space-x-0">
              <div className="flex flex-wrap gap-1">
                <Link href="/entries" className="text-xs text-primary hover:underline">
                  Ver Entradas →
                </Link>
                <span className="text-muted-foreground text-xs">•</span>
                <Link href="/neologisms" className="text-xs text-primary hover:underline">
                  Neologismos →
                </Link>
                <span className="text-muted-foreground text-xs">•</span>
                <Link href="/toponyms" className="text-xs text-primary hover:underline">
                  Topónimos →
                </Link>
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setResultDialogOpen(false)}
              >
                Concluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Sub-componentes auxiliares ─────────────────────────────────────────────

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
