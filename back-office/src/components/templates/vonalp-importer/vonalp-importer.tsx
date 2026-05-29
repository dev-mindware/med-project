"use client";

import type { ComponentProps } from "react";
import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress,
  Badge,
} from "@/components/ui";
import { Icon } from "@/components/common";
import { cn } from "@/lib/utils";
import { ErrorMessage, SucessMessage, WarningMessage } from "@/utils/messages";
import { useAuth } from "@/hooks";
import { vonalpImportService } from "@/services";
import { downloadImportReport, downloadImportTemplate } from "./importer-excel";
import { parseVonalpWorkbook } from "./importer-parser";
import { vonalpImportConfigs } from "./importer-config";
import type {
  ImportErrorRow,
  ImportFinalReport,
  ImportPayloadRow,
  ImportWarningRow,
  VonalpImportKind,
} from "./types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CHUNK_SIZE = 50;

type ImportPhase = "idle" | "validating" | "ready" | "importing" | "done";

type ParsedImport = {
  totalRows: number;
  rows: ImportPayloadRow[];
  errors: ImportErrorRow[];
  warnings: ImportWarningRow[];
};

export function VonalpImporter({ kind }: { kind: VonalpImportKind }) {
  const config = vonalpImportConfigs[kind];
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [report, setReport] = useState<ImportFinalReport | null>(null);
  const [progress, setProgress] = useState(0);

  const isBusy = phase === "validating" || phase === "importing";
  const canImport = user?.role !== "SUPERVISOR";

  const summary = useMemo(() => {
    const invalidRows = countErrorRows(parsed?.errors ?? []);
    return {
      totalRows: parsed?.totalRows ?? 0,
      validRows: parsed?.rows.length ?? 0,
      invalidRows,
      warningRows: countWarningRows(parsed?.warnings ?? []),
    };
  }, [parsed]);

  if (!canImport) return null;

  const handleDownloadTemplate = async () => {
    try {
      await downloadImportTemplate(config);
      SucessMessage("Template gerado com sucesso.");
    } catch {
      ErrorMessage("Nao foi possivel gerar o template.");
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value && isBusy) return;
    setOpen(value);
    if (!value) resetImport();
  };

  const resetImport = () => {
    setPhase("idle");
    setFileName("");
    setParsed(null);
    setReport(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileChange = async (file?: File | null) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      ErrorMessage("Seleccione um ficheiro Excel no formato .xlsx.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      ErrorMessage("O ficheiro excede o limite de 5MB.");
      return;
    }

    setPhase("validating");
    setFileName(file.name);
    setReport(null);
    setProgress(0);

    try {
      const result = await parseVonalpWorkbook(file, config);
      setParsed(result);
      setPhase("ready");

      if (result.rows.length === 0 && result.errors.length > 0) {
        WarningMessage("O ficheiro foi lido, mas nao possui linhas validas para importar.");
      } else if (result.errors.length > 0) {
        WarningMessage("Algumas linhas possuem erros e serao ignoradas.");
      } else if (result.warnings.length > 0) {
        WarningMessage("Ficheiro validado com alertas de qualidade.");
      } else {
        SucessMessage("Ficheiro validado com sucesso.");
      }
    } catch {
      setPhase("idle");
      ErrorMessage("Nao foi possivel ler o ficheiro Excel.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleStartImport = async () => {
    if (!parsed || parsed.rows.length === 0) {
      ErrorMessage("Nao existem linhas validas para importar.");
      return;
    }

    setPhase("importing");
    setProgress(0);

    const created: ImportFinalReport["created"] = [];
    const apiErrors: ImportErrorRow[] = [];
    const chunks = chunkRows(parsed.rows, CHUNK_SIZE);
    let processed = 0;

    for (const chunk of chunks) {
      try {
        const response = await vonalpImportService.importRows(config.endpoint, chunk);
        created.push(...response.created);
        apiErrors.push(...response.errors.map((error) => ({
          ...error,
          field: fieldLabel(error.field),
        })));
      } catch (error: any) {
        apiErrors.push(...chunk.map((row) => ({
          rowNumber: row.rowNumber,
          message: error?.response?.data?.message || "Falha ao enviar esta linha para a API.",
        })));
      } finally {
        processed += chunk.length;
        setProgress(Math.round((processed / parsed.rows.length) * 100));
      }
    }

    const finalReport: ImportFinalReport = {
      totalRows: parsed.totalRows,
      validRows: parsed.rows.length,
      invalidRows: countErrorRows(parsed.errors),
      warningCount: parsed.warnings.length,
      successCount: created.length,
      errorCount: parsed.errors.length + apiErrors.length,
      created,
      errors: [...parsed.errors, ...apiErrors],
      warnings: parsed.warnings,
    };

    setReport(finalReport);
    setPhase("done");
    queryClient.invalidateQueries({ queryKey: [config.queryKey] });

    if (finalReport.successCount > 0 && finalReport.errorCount > 0) {
      WarningMessage("Importacao concluida parcialmente.");
    } else if (finalReport.successCount > 0) {
      SucessMessage("Importacao concluida com sucesso.");
    } else {
      ErrorMessage("Nenhuma linha foi importada.");
    }
  };

  const handleDownloadReport = async () => {
    if (!report) return;
    try {
      await downloadImportReport(config, report);
    } catch {
      ErrorMessage("Nao foi possivel gerar o relatorio.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="gap-2">
            <Icon name="FileSpreadsheet" className="h-4 w-4" />
            Importador
            <Icon name="ChevronDown" className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={handleDownloadTemplate}>
            <Icon name="Download" className="h-4 w-4" />
            Descarregar template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Icon name="Upload" className="h-4 w-4" />
            Importar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[88vh] max-w-5xl">
          <DialogHeader>
            <DialogTitle>Importar {config.title}</DialogTitle>
            <DialogDescription>
              Carregue o ficheiro Excel baseado no template deste modulo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <label
                htmlFor={`vonalp-import-${kind}`}
                className={cn(
                  "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-card p-6 text-center transition",
                  "hover:border-primary hover:bg-primary/5",
                  isBusy && "pointer-events-none opacity-60"
                )}
              >
                <input
                  ref={inputRef}
                  id={`vonalp-import-${kind}`}
                  type="file"
                  className="hidden"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  disabled={isBusy}
                  onChange={(event) => handleFileChange(event.target.files?.[0])}
                />
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon name={phase === "validating" ? "LoaderCircle" : "CloudUpload"} className={cn("h-6 w-6 text-primary", phase === "validating" && "animate-spin")} />
                </span>
                <span className="text-sm font-semibold">
                  {fileName || "Arraste ou clique para selecionar o ficheiro Excel"}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Apenas .xlsx, maximo 5MB e ate 1000 linhas
                </span>
              </label>

              {parsed && (
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Pre-validacao</h3>
                      <p className="text-sm text-muted-foreground">Linhas validas serao enviadas para a API.</p>
                    </div>
                    <Badge variant={parsed.errors.length > 0 ? "pending" : "success"}>
                      {parsed.errors.length > 0 ? "Com erros" : parsed.warnings.length > 0 ? "Com alertas" : "Validado"}
                    </Badge>
                  </div>
                  <StatsGrid
                    items={[
                      ["Lidas", summary.totalRows],
                      ["Validas", summary.validRows],
                      ["Invalidas", summary.invalidRows],
                      ["Alertas", summary.warningRows],
                    ]}
                  />
                </div>
              )}

              {phase === "importing" && (
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="LoaderCircle" className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">A importar dados</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {report && (
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Relatorio final</h3>
                      <p className="text-sm text-muted-foreground">Resumo da importacao executada.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleDownloadReport}>
                      <Icon name="Download" className="h-4 w-4" />
                      Descarregar relatório
                    </Button>
                  </div>
                  <StatsGrid
                    items={[
                      ["Importadas", report.successCount],
                      ["Erros", report.errorCount],
                      ["Alertas", report.warningCount],
                      ["Lidas", report.totalRows],
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <ImportStatusCard phase={phase} />
              <WarningPreview warnings={report?.warnings || parsed?.warnings || []} />
              <ErrorPreview errors={report?.errors || parsed?.errors || []} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isBusy}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={phase === "done" ? handleDownloadReport : handleStartImport}
              disabled={!parsed || parsed.rows.length === 0}
              loading={phase === "importing"}
            >
              <Icon name={phase === "done" ? "Download" : "Upload"} className="h-4 w-4" />
              {phase === "done" ? "Descarregar relatório" : "Iniciar importação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatsGrid({ items }: { items: Array<[string, number]> }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border bg-muted/30 p-3">
          <div className="text-lg font-semibold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}

function ImportStatusCard({ phase }: { phase: ImportPhase }) {
  const states: Record<ImportPhase, { label: string; icon: ComponentProps<typeof Icon>["name"]; description: string }> = {
    idle: { label: "À espera do ficheiro", icon: "FileSpreadsheet", description: "Seleccione um template preenchido." },
    validating: { label: "A validar", icon: "LoaderCircle", description: "A ler linhas e regras do ficheiro." },
    ready: { label: "Pronto", icon: "CircleCheck", description: "Pode iniciar a importacao." },
    importing: { label: "Importacao ativa", icon: "LoaderCircle", description: "A enviar linhas validas em lotes." },
    done: { label: "Concluido", icon: "CheckCheck", description: "Relatorio final disponivel." },
  };
  const current = states[phase];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <Icon
            name={current.icon}
            className={cn("h-5 w-5 text-primary", current.icon === "LoaderCircle" && "animate-spin")}
          />
        </span>
        <div>
          <h3 className="text-sm font-semibold">{current.label}</h3>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>
      </div>
    </div>
  );
}

function WarningPreview({ warnings }: { warnings: ImportWarningRow[] }) {
  const visible = warnings.slice(0, 6);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Alertas de qualidade</h3>
        <Badge variant={warnings.length > 0 ? "pending" : "secondary"}>{warnings.length}</Badge>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum alerta encontrado.</p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {visible.map((warning, index) => (
            <div key={`${warning.rowNumber}-${warning.field}-${index}`} className="rounded-md border bg-muted/30 p-3">
              <div className="text-xs font-semibold">Linha {warning.rowNumber || "-"}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {warning.field ? `${warning.field}: ` : ""}
                {warning.message}
              </div>
            </div>
          ))}
          {warnings.length > visible.length && (
            <p className="text-xs text-muted-foreground">Mais {warnings.length - visible.length} alertas no relatorio.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ErrorPreview({ errors }: { errors: ImportErrorRow[] }) {
  const visible = errors.slice(0, 8);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Erros encontrados</h3>
        <Badge variant={errors.length > 0 ? "destructive" : "secondary"}>{errors.length}</Badge>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum erro encontrado ate ao momento.</p>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {visible.map((error, index) => (
            <div key={`${error.rowNumber}-${error.field}-${index}`} className="rounded-md border bg-muted/30 p-3">
              <div className="text-xs font-semibold">Linha {error.rowNumber || "-"}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {error.field ? `${error.field}: ` : ""}
                {error.message}
              </div>
            </div>
          ))}
          {errors.length > visible.length && (
            <p className="text-xs text-muted-foreground">Mais {errors.length - visible.length} erros no relatorio.</p>
          )}
        </div>
      )}
    </div>
  );
}

function chunkRows(rows: ImportPayloadRow[], size: number) {
  const chunks: ImportPayloadRow[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

function countErrorRows(errors: ImportErrorRow[]) {
  return new Set(errors.map((error) => error.rowNumber)).size;
}

function countWarningRows(warnings: ImportWarningRow[]) {
  return new Set(warnings.map((warning) => warning.rowNumber)).size;
}

function fieldLabel(field?: string) {
  if (!field) return undefined;
  return Object.values(vonalpImportConfigs)
    .flatMap((config) => config.columns)
    .find((column) => column.key === field || column.label === field)?.label || field;
}
