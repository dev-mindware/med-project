"use client";

import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui";
import { Icon, TitleList } from "@/components/common";
import { useExtractManualVocabulary } from "@/hooks";
import { ManualVocabularyExtractResult } from "@/types";
import { cn } from "@/lib/utils";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function ManualVocabularyPageContent() {
  const [file, setFile] = useState<File | null>(null);
  const [lastResult, setLastResult] = useState<ManualVocabularyExtractResult | null>(null);
  const extract = useExtractManualVocabulary();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const nextFile = acceptedFiles[0];
    if (!nextFile) return;

    if (nextFile.type !== "application/pdf") {
      ErrorMessage("Seleccione um ficheiro PDF.");
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      ErrorMessage("O ficheiro excede o limite de 50MB.");
      return;
    }

    setFile(nextFile);
    setLastResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: extract.isPending,
  });

  const progress = useMemo(() => {
    if (extract.isPending) return 68;
    if (lastResult) return 100;
    return file ? 20 : 0;
  }, [extract.isPending, file, lastResult]);

  const handleExtract = async () => {
    if (!file) {
      ErrorMessage("Seleccione um PDF antes de processar.");
      return;
    }

    try {
      const result = await extract.mutateAsync(file);
      setLastResult(result);
      SucessMessage("Excel gerado com sucesso.");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Não foi possível processar o manual.");
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <TitleList
        title="Extrair vocabulário"
        suTitle="Converta manuais PDF em ficheiros Excel revisáveis para importação no acervo."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-lg border-border">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Manual PDF</CardTitle>
                <CardDescription>PDF até 50MB</CardDescription>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
                <Icon name="FileSearch" className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              {...getRootProps()}
              className={cn(
                "flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center transition-colors",
                isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/30",
                extract.isPending && "pointer-events-none opacity-70",
              )}
            >
              <input {...getInputProps()} />
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-primary/10">
                <Icon name={file ? "FileText" : "CloudUpload"} className="h-7 w-7 text-primary" />
              </div>
              {file ? (
                <div className="space-y-1">
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold">Arraste o PDF ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground">application/pdf</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Progress value={progress} />
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  onClick={handleExtract}
                  loading={extract.isPending}
                  disabled={!file || extract.isPending}
                >
                  <Icon name="Sparkles" className="h-4 w-4" />
                  Processar manual
                </Button>
                {file && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setLastResult(null);
                    }}
                    disabled={extract.isPending}
                  >
                    <Icon name="X" className="h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="rounded-lg border-border">
            <CardHeader>
              <CardTitle className="text-base">Estado</CardTitle>
              <CardDescription>{extract.isPending ? "A processar" : lastResult ? "Concluído" : "A aguardar"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusRow icon="FileText" label="PDF" value={file ? "Seleccionado" : "Pendente"} />
              <StatusRow icon="ScanText" label="OCR" value={extract.isPending || lastResult ? "Activo" : "Pendente"} />
              <StatusRow icon="Brain" label="IA" value={extract.isPending || lastResult ? "Activa" : "Pendente"} />
              <StatusRow icon="FileSpreadsheet" label="Excel" value={lastResult ? "Gerado" : "Pendente"} />
            </CardContent>
          </Card>

          {lastResult && (
            <Card className="rounded-lg border-border">
              <CardHeader>
                <CardTitle className="text-base">Resumo</CardTitle>
                <CardDescription>{lastResult.filename}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Metric label="Vocábulos" value={lastResult.stats.totalTerms} />
                <Metric label="Válidos" value={lastResult.stats.validRows} />
                <Metric label="Avisos" value={lastResult.stats.warnings} />
                <Metric label="Duplicados" value={lastResult.stats.duplicatesRemoved} />
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function StatusRow({ icon, label, value }: { icon: React.ComponentProps<typeof Icon>["name"]; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon name={icon} className="h-4 w-4 text-primary" />
        {label}
      </div>
      <Badge variant="secondary">{value}</Badge>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
