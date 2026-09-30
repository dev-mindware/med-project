"use client";

import React, { useCallback, useMemo, useState } from "react";
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
  useCommitManualVocabularyToDatabase,
  useExportExcelManualVocabulary,
  useExtractManualVocabularyPreview,
  useImportExcelManualVocabulary,
  useManualVocabularyLogs,
} from "@/hooks";
import {
  ManualExtractionLogItem,
  ManualVocabularyCommitResult,
  ManualVocabularySourceModel,
  ManualVocabularyWorkbookData,
} from "@/types";
import { cn } from "@/lib/utils";
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
  const [editingItem, setEditingItem] = useState<{
    module: ManualVocabularySourceModel;
    index: number;
    data: Record<string, any>;
  } | null>(null);

  // Database Commit & Duplicates State
  const [commitDialogOpen, setCommitDialogOpen] = useState<boolean>(false);
  const [commitResult, setCommitResult] = useState<ManualVocabularyCommitResult | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState<boolean>(false);

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

    if (nextFile.size > MAX_PDF_SIZE) {
      ErrorMessage("O ficheiro excede o limite de 100MB.");
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
          `Folha Excel importada! ${result.stats.totalTerms} termos carregados para curadoria.`,
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

    try {
      const result = await extractPreview.mutateAsync({
        file,
        modules: selectedModules,
        startPage: parsedStart,
        endPage: parsedEnd,
      });

      setStagingData(result.workbookData);
      setSourceFilename(file.name);
      setActiveTab("staging");
      SucessMessage(
        `Extracção concluída! ${result.stats.totalTerms} termos carregados para curadoria.`,
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
      const result = await commitToDb.mutateAsync({
        entries: stagingData.entries,
        neologisms: stagingData.neologisms,
        toponyms: stagingData.toponyms,
        anthroponyms: stagingData.anthroponyms,
        foreignisms: stagingData.foreignisms,
      });

      setCommitResult(result);
      setCommitDialogOpen(false);
      setResultDialogOpen(true);

      if (result.insertedCount > 0) {
        SucessMessage(
          `${result.insertedCount} novos registos foram inseridos na base de dados (em estado Rascunho/DRAFT)!`,
        );
      }
      if (result.duplicatesCount > 0) {
        ErrorMessage(
          `${result.duplicatesCount} registos duplicados foram ignorados para proteger a integridade da base de dados.`,
        );
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

  const handleDeleteItem = (module: ManualVocabularySourceModel, index: number) => {
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
    mod: ManualVocabularySourceModel,
  ): "entries" | "neologisms" | "toponyms" | "anthroponyms" | "foreignisms" {
    switch (mod) {
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

  function getModuleLabel(mod: ManualVocabularySourceModel): string {
    switch (mod) {
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

  // Filtered rows for current staging tab
  const currentStagingRows = useMemo(() => {
    if (!stagingData) return [];
    if (activeStagingTab === "WARNINGS") return [];

    const key = getModuleDataKey(activeStagingTab as ManualVocabularySourceModel);
    const list = stagingData[key] || [];

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();

    return list.filter((item) => {
      const term = String(
        item.entry || item.toponym || item.name || item.term || "",
      ).toLowerCase();
      const def = String(
        item.firstDefinition || item.meaning || item.definition || "",
      ).toLowerCase();
      const province = String(item.province || "").toLowerCase();
      return term.includes(q) || def.includes(q) || province.includes(q);
    });
  }, [stagingData, activeStagingTab, searchQuery]);

  return (
    <div className="mt-6 space-y-6">
      <TitleList
        title="Automação, Curadoria & Extracção Lexical"
        suTitle="Leitura inteligente de manuais PDF, importação de folhas Excel, curadoria em tempo real e persistência com validação forte de duplicatas."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="extract" className="flex items-center gap-2">
            <Icon name="Sparkles" className="h-4 w-4" />
            Nova Extracção
          </TabsTrigger>
          <TabsTrigger value="staging" className="flex items-center gap-2 relative">
            <Icon name="Layers" className="h-4 w-4" />
            Curadoria & Validação
            {stagingData && (
              <Badge variant="default" className="ml-1.5 px-1.5 py-0 text-[10px] h-4">
                {stagingData.stats.totalTerms}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Icon name="History" className="h-4 w-4" />
            Histórico & Auditoria
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: NOVA EXTRACÇÃO / IMPORTAÇÃO ───────────────────────────── */}
        <TabsContent value="extract" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* PAINEL PRINCIPAL: OPÇÕES DE ENTRADA */}
            <div className="space-y-6 lg:col-span-2">
              {/* ESCOLHA DOS MÓDULOS */}
              <Card className="rounded-lg border-border">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">Módulos a Identificar</CardTitle>
                      <CardDescription>
                        Seleccione quais os tipos de vocabulário que a inteligência artificial deve reconhecer no manual.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllModules}
                        disabled={
                          extractPreview.isPending ||
                          selectedModules.length === AVAILABLE_MODULES.length
                        }
                      >
                        Todos
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllModules}
                        disabled={extractPreview.isPending || selectedModules.length === 0}
                      >
                        Limpar
                      </Button>
                      <Badge variant="secondary" className="ml-1 font-semibold">
                        {selectedModules.length} de {AVAILABLE_MODULES.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {AVAILABLE_MODULES.map((mod) => {
                      const isChecked = selectedModules.includes(mod.id);
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => toggleModule(mod.id)}
                          disabled={extractPreview.isPending}
                          className={cn(
                            "group relative flex flex-col justify-between rounded-lg border p-4 text-left transition-all",
                            isChecked
                              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/20 opacity-70",
                            extractPreview.isPending && "pointer-events-none opacity-50",
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className={cn(
                                  "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                                  isChecked
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <Icon name={mod.icon} className="h-5 w-5" />
                              </div>
                              <div
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                                  isChecked
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/40",
                                )}
                              >
                                {isChecked && <Icon name="Check" className="h-3.5 w-3.5" />}
                              </div>
                            </div>
                            <p className="mt-3 font-semibold text-sm text-foreground">
                              {mod.label}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {mod.shortDesc}
                            </p>
                          </div>
                          <div className="mt-3 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground/80">Ex: </span>
                            <span className="italic">{mod.examples}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* OPÇÃO 1: DROPZONE PDF (EXTRACÇÃO COM IA) */}
              <Card className="rounded-lg border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Opção A: Extrair de Manual PDF</CardTitle>
                      <CardDescription>
                        Carregue uma obra ou documento em formato PDF para análise automatizada pela IA.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    {...getPdfRootProps()}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                      isPdfDragActive
                        ? "border-primary bg-primary/10"
                        : file
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/30",
                      extractPreview.isPending && "pointer-events-none opacity-60",
                    )}
                  >
                    <input {...getPdfInputProps()} />
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon name="Upload" className="h-6 w-6" />
                    </div>
                    {file ? (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                        <p className="text-xs text-emerald-600 font-medium">
                          Ficheiro PDF pronto para processamento
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Arraste o manual PDF aqui ou clique para seleccionar
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF nativo ou digitalizado até 100MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* INTERVALO DE PÁGINAS */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Icon name="SlidersHorizontal" className="h-3.5 w-3.5" />
                      Filtro de Páginas (Opcional)
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Página Inicial</label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Ex: 1"
                          value={startPage}
                          onChange={(e) => setStartPage(e.target.value)}
                          disabled={extractPreview.isPending}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Página Final</label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Ex: 50"
                          value={endPage}
                          onChange={(e) => setEndPage(e.target.value)}
                          disabled={extractPreview.isPending}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
                    <Button
                      type="button"
                      onClick={handleExtract}
                      loading={extractPreview.isPending}
                      disabled={!file || extractPreview.isPending || selectedModules.length === 0}
                      className="px-6"
                    >
                      <Icon name="Sparkles" className="h-4 w-4" />
                      {extractPreview.isPending
                        ? "A processar com IA..."
                        : "Extrair & Abrir Curadoria"}
                    </Button>
                    {file && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFile(null)}
                        disabled={extractPreview.isPending}
                      >
                        <Icon name="X" className="h-4 w-4" />
                        Remover PDF
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* OPÇÃO 2: IMPORTAR FOLHA EXCEL EXISTENTE */}
              <Card className="rounded-lg border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="FileSpreadsheet" className="h-5 w-5 text-emerald-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Opção B: Importar Ficheiro Excel (.xlsx)
                      </CardTitle>
                      <CardDescription>
                        Carregue uma folha de cálculo Excel gerada anteriormente ou preenchida manualmente para curadoria e validação no ecrã.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    {...getExcelRootProps()}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                      isExcelDragActive
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border hover:border-emerald-500/50 hover:bg-muted/30",
                      importExcel.isPending && "pointer-events-none opacity-60",
                    )}
                  >
                    <input {...getExcelInputProps()} />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <Icon name="Table" className="h-5 w-5" />
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {importExcel.isPending
                          ? "A processar folha Excel..."
                          : "Arraste um ficheiro .xlsx aqui ou clique para carregar"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Folhas suportadas: Entradas, Neologismos, Topónimos, Antropónimos, Estrangeirismos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* PAINEL LATERAL: PIPELINE E INFORMAÇÕES */}
            <aside className="space-y-4">
              <Card className="rounded-lg border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Fluxo de Trabalho</CardTitle>
                    <Badge variant={extractPreview.isPending ? "default" : "secondary"}>
                      {extractPreview.isPending ? "Em execução" : "Pronto"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <PipelineStep
                    step="1"
                    title="Leitura & Extracção"
                    status={file ? "done" : "idle"}
                    desc="Processamento PDF ou importação directa de Excel"
                  />
                  <PipelineStep
                    step="2"
                    title="Curadoria no Ecrã"
                    status={stagingData ? "done" : extractPreview.isPending ? "active" : "idle"}
                    desc="Edição, correcção de verbetes e reclassificação de módulos"
                  />
                  <PipelineStep
                    step="3"
                    title="Exportação Excel"
                    status={stagingData ? "done" : "idle"}
                    desc="Geração do ficheiro .xlsx com dados curados"
                  />
                  <PipelineStep
                    step="4"
                    title="Validação & Registo"
                    status={commitResult ? "done" : "idle"}
                    desc="Validação forte de duplicatas e gravação na base de dados"
                  />
                </CardContent>
              </Card>

              {/* CARD DE NORMA ORTOGRÁFICA */}
              <Card className="rounded-lg border-border bg-muted/20">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Icon name="ShieldCheck" className="h-4 w-4" />
                    Norma Ortográfica Obrigatória
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Este sistema está estritamente afinado para o <strong>Acordo Ortográfico de 1945 (AO45)</strong>,
                    padrão oficial de Angola. Consoantes mudas (<em>acção</em>, <em>óptimo</em>, <em>facto</em>)
                    e regras de hifenização tradicionais são preservadas sem brasileirismos.
                  </p>
                </CardContent>
              </Card>
            </aside>
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
                  Extraia o vocabulário de um manual PDF na aba &ldquo;Nova Extracção&rdquo; ou importe um
                  ficheiro Excel (.xlsx) para visualizar, editar e salvar na base de dados.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("extract")}
                  className="mt-2"
                >
                  <Icon name="Upload" className="h-4 w-4" />
                  Ir para Extracção / Importação
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Revise os vocábulos, faça correcções, reclassifique módulos e salve na base de dados com deduplicação rigorosa.
                  </p>
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
                    <Icon name="Database" className="h-4 w-4" />
                    Salvar na Base de Dados
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

              {/* CARDS DE KPIS */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                <MetricCard
                  label="Total Extraído"
                  value={stagingData.stats.totalTerms}
                  icon="Sparkles"
                  highlight
                />
                <MetricCard
                  label="Entradas"
                  value={stagingData.entries.length}
                  icon="BookOpen"
                />
                <MetricCard
                  label="Neologismos"
                  value={stagingData.neologisms.length}
                  icon="Sparkles"
                />
                <MetricCard
                  label="Topónimos"
                  value={stagingData.toponyms.length}
                  icon="MapPin"
                />
                <MetricCard
                  label="Antropónimos"
                  value={stagingData.anthroponyms.length}
                  icon="UserCheck"
                />
                <MetricCard
                  label="Estrangeirismos"
                  value={stagingData.foreignisms.length}
                  icon="Globe"
                />
                <MetricCard
                  label="Avisos"
                  value={stagingData.warnings.length}
                  icon="CircleAlert"
                />
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
                        {stagingData.warnings.length > 0 && (
                          <TabsTrigger value="WARNINGS" className="text-xs text-amber-600">
                            Avisos ({stagingData.warnings.length})
                          </TabsTrigger>
                        )}
                      </TabsList>
                    </Tabs>

                    {/* CAMPO DE PESQUISA RÁPIDA */}
                    {activeStagingTab !== "WARNINGS" && (
                      <div className="w-full sm:w-64">
                        <Input
                          type="search"
                          placeholder="Pesquisar termo ou texto..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 text-xs"
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
                            <TableHead className="w-32">Termo</TableHead>
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
                            <TableHead className="w-10">#</TableHead>
                            <TableHead className="min-w-[180px]">
                              {activeStagingTab === "TOPONYM"
                                ? "Topónimo"
                                : activeStagingTab === "ANTHROPONYM"
                                  ? "Nome Próprio"
                                  : activeStagingTab === "FOREIGNISM"
                                    ? "Termo Estrangeiro"
                                    : "Vocábulo / Entrada"}
                            </TableHead>
                            <TableHead className="min-w-[240px]">Definição / Significado</TableHead>
                            <TableHead className="w-36">
                              {activeStagingTab === "TOPONYM"
                                ? "Província / Local"
                                : activeStagingTab === "ANTHROPONYM"
                                  ? "Género / Apelido"
                                  : activeStagingTab === "FOREIGNISM"
                                    ? "Idioma / Integração"
                                    : "Tipo / Cat. Gramatical"}
                            </TableHead>
                            <TableHead className="w-24 text-center">Confiança</TableHead>
                            <TableHead className="w-32 text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentStagingRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm">
                                Nenhum registo encontrado com o critério de pesquisa.
                              </TableCell>
                            </TableRow>
                          ) : (
                            currentStagingRows.map((row, idx) => {
                              const term =
                                row.entry || row.toponym || row.name || row.term || "Sem título";
                              const definition =
                                row.firstDefinition || row.meaning || row.definition || "—";
                              const confidence = Number(row.confidence ?? 1);

                              return (
                                <TableRow key={idx} className="hover:bg-muted/20">
                                  <TableCell className="font-mono text-xs text-muted-foreground">
                                    {idx + 1}
                                  </TableCell>
                                  <TableCell className="font-semibold text-sm text-foreground">
                                    <div className="flex items-center gap-2">
                                      <span>{term}</span>
                                      {row.isForeignism && (
                                        <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200">
                                          Estrangeiro
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                                    {definition}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {activeStagingTab === "TOPONYM" ? (
                                      <span className="font-medium text-foreground">
                                        {row.province || "Angola"}
                                        {row.municipality ? ` (${row.municipality})` : ""}
                                      </span>
                                    ) : activeStagingTab === "ANTHROPONYM" ? (
                                      <span>
                                        {row.gender ? `${row.gender}` : ""}
                                        {row.surname ? ` / ${row.surname}` : ""}
                                      </span>
                                    ) : activeStagingTab === "FOREIGNISM" ? (
                                      <span>
                                        {row.originalLanguage || "—"} / {row.integrationLevel || "adaptado"}
                                      </span>
                                    ) : (
                                      <span>
                                        {row.wordType || "simples"}
                                        {row.grammaticalCategory ? ` • ${row.grammaticalCategory}` : ""}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant={
                                        confidence >= 0.8
                                          ? "default"
                                          : confidence >= 0.6
                                            ? "secondary"
                                            : "outline"
                                      }
                                      className={cn(
                                        "text-[10px] font-mono",
                                        confidence >= 0.8 && "bg-emerald-500 text-white",
                                        confidence < 0.8 && confidence >= 0.6 && "bg-amber-500/20 text-amber-700",
                                      )}
                                    >
                                      {(confidence * 100).toFixed(0)}%
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {/* BOTÃO EDITAR */}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        title="Editar este registo"
                                        onClick={() =>
                                          setEditingItem({
                                            module: activeStagingTab as ManualVocabularySourceModel,
                                            index: idx,
                                            data: { ...row },
                                          })
                                        }
                                      >
                                        <Icon name="Pencil" className="h-3.5 w-3.5" />
                                      </Button>

                                      {/* DROPDOWN RECLASSIFICAR */}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-primary"
                                            title="Reclassificar / Mover para outro módulo"
                                          >
                                            <Icon name="RefreshCw" className="h-3.5 w-3.5" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                          <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase">
                                            Reclassificar para:
                                          </div>
                                          {AVAILABLE_MODULES.filter(
                                            (m) => m.id !== activeStagingTab,
                                          ).map((m) => (
                                            <DropdownMenuItem
                                              key={m.id}
                                              onClick={() =>
                                                handleReclassify(
                                                  activeStagingTab as ManualVocabularySourceModel,
                                                  idx,
                                                  m.id,
                                                )
                                              }
                                              className="text-xs cursor-pointer flex items-center gap-2"
                                            >
                                              <Icon name={m.icon} className="h-3.5 w-3.5" />
                                              {m.label}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuContent>
                                      </DropdownMenu>

                                      {/* BOTÃO ELIMINAR */}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                        title="Eliminar da curadoria"
                                        onClick={() =>
                                          handleDeleteItem(
                                            activeStagingTab as ManualVocabularySourceModel,
                                            idx,
                                          )
                                        }
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
                <div>
                  <CardTitle className="text-lg">Auditoria de Extracções</CardTitle>
                  <CardDescription>
                    Registo completo de todos os manuais processados, modelo de IA e volumes gerados.
                  </CardDescription>
                </div>
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
                        <TableHead>Modelo IA</TableHead>
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
                          <TableCell>
                            <Badge variant="outline" className="text-[11px] font-mono">
                              {log.model}
                            </Badge>
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
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="Pencil" className="h-4 w-4 text-primary" />
                Editar {getModuleLabel(editingItem.module)}
              </DialogTitle>
              <DialogDescription>
                Ajuste os campos deste termo antes de salvar na base de dados ou exportar para Excel.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const edited: Record<string, any> = {};
                formData.forEach((val, key) => {
                  edited[key] = val;
                });
                handleSaveEditedItem(edited);
              }}
              className="space-y-4"
            >
              {/* Campo Principal */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  {editingItem.module === "TOPONYM"
                    ? "Topónimo"
                    : editingItem.module === "ANTHROPONYM"
                      ? "Nome Próprio"
                      : editingItem.module === "FOREIGNISM"
                        ? "Termo Estrangeiro"
                        : "Vocábulo / Entrada"}
                </label>
                <Input
                  name={
                    editingItem.module === "TOPONYM"
                      ? "toponym"
                      : editingItem.module === "ANTHROPONYM"
                        ? "name"
                        : editingItem.module === "FOREIGNISM"
                          ? "term"
                          : "entry"
                  }
                  defaultValue={
                    editingItem.data.entry ||
                    editingItem.data.toponym ||
                    editingItem.data.name ||
                    editingItem.data.term ||
                    ""
                  }
                  required
                  className="mt-1"
                />
              </div>

              {/* Definição / Significado */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  {editingItem.module === "FOREIGNISM" ? "Definição" : "Primeira Definição / Significado"}
                </label>
                <Input
                  name={
                    editingItem.module === "FOREIGNISM"
                      ? "definition"
                      : editingItem.module === "TOPONYM" || editingItem.module === "ANTHROPONYM"
                        ? "meaning"
                        : "firstDefinition"
                  }
                  defaultValue={
                    editingItem.data.firstDefinition ||
                    editingItem.data.definition ||
                    editingItem.data.meaning ||
                    ""
                  }
                  className="mt-1"
                />
              </div>

              {/* Campos específicos por modelo */}
              {editingItem.module === "TOPONYM" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Província</label>
                    <Input
                      name="province"
                      defaultValue={editingItem.data.province || "Angola"}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Município</label>
                    <Input
                      name="municipality"
                      defaultValue={editingItem.data.municipality || ""}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {editingItem.module === "ANTHROPONYM" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Género (M/F)</label>
                    <Input
                      name="gender"
                      defaultValue={editingItem.data.gender || "M"}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Apelido / Sobrenome</label>
                    <Input
                      name="surname"
                      defaultValue={editingItem.data.surname || ""}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {editingItem.module === "FOREIGNISM" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Idioma Original</label>
                    <Input
                      name="originalLanguage"
                      defaultValue={editingItem.data.originalLanguage || "Inglês"}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Nível de Integração</label>
                    <Input
                      name="integrationLevel"
                      defaultValue={editingItem.data.integrationLevel || "adaptado"}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {(editingItem.module === "ENTRY" || editingItem.module === "NEOLOGISM") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Tipo de Palavra</label>
                    <Input
                      name="wordType"
                      defaultValue={editingItem.data.wordType || "simples"}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Categoria Gramatical</label>
                    <Input
                      name="grammaticalCategory"
                      defaultValue={editingItem.data.grammaticalCategory || ""}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

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
              <Icon name="Database" className="h-5 w-5 text-primary" />
              Salvar Tudo na Base de Dados
            </DialogTitle>
            <DialogDescription>
              Tem a certeza de que deseja persistir os vocábulos curados na base de dados?
            </DialogDescription>
          </DialogHeader>

          {stagingData && (
            <div className="space-y-3 py-2 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
                <p className="font-semibold text-foreground">Resumo a enviar:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span>• Entradas: {stagingData.entries.length}</span>
                  <span>• Neologismos: {stagingData.neologisms.length}</span>
                  <span>• Topónimos: {stagingData.toponyms.length}</span>
                  <span>• Antropónimos: {stagingData.anthroponyms.length}</span>
                  <span>• Estrangeirismos: {stagingData.foreignisms.length}</span>
                  <span className="font-semibold text-foreground">
                    • Total: {stagingData.stats.totalTerms}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Icon name="ShieldAlert" className="h-4 w-4" />
                  Validação Forte de Duplicatas
                </p>
                <p>
                  O servidor PostgreSQL verificará termo a termo. Quaisquer vocábulos que já existam
                  no dicionário serão automaticamente ignorados para evitar duplicidade e manter a integridade referencial.
                </p>
              </div>
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
              <Icon name="Check" className="h-4 w-4" />
              Confirmar & Salvar
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
                Relatório de Gravação na Base de Dados
              </DialogTitle>
              <DialogDescription>
                A validação forte de duplicatas e o processo de gravação foram concluídos.
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
                  <p className="text-xs text-amber-700 font-semibold uppercase">Duplicados Ignorados</p>
                  <p className="text-3xl font-bold text-amber-700 mt-1">
                    {commitResult.duplicatesCount}
                  </p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Preservados sem duplicar</p>
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
                    Vocábulos Ignorados por Duplicação ({commitResult.skippedDuplicates.length}):
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

function PipelineStep({
  step,
  title,
  desc,
  status,
}: {
  step: string;
  title: string;
  desc: string;
  status: "idle" | "active" | "done";
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border bg-card p-2.5">
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          status === "done" && "bg-emerald-500 text-white",
          status === "active" && "bg-primary text-primary-foreground animate-pulse",
          status === "idle" && "bg-muted text-muted-foreground",
        )}
      >
        {status === "done" ? <Icon name="Check" className="h-3.5 w-3.5" /> : step}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Icon>["name"];
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        highlight ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        <Icon name={icon} className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
