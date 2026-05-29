"use client";

import { ChangeEvent, useId } from "react";
import { FileAudio, Image, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertError } from "@/components/common/alert-error";
import { cn } from "@/lib/utils";

type MediaUploadKind = "image" | "audio";

interface MediaUploadFieldProps {
  label: string;
  value?: string | null;
  kind: MediaUploadKind;
  accept: string;
  error?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function MediaUploadField({
  label,
  value,
  kind,
  accept,
  error,
  isLoading = false,
  disabled = false,
  onFileSelect,
  onClear,
}: MediaUploadFieldProps) {
  const inputId = useId();
  const Icon = kind === "image" ? Image : FileAudio;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onFileSelect(file);
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div
        className={cn(
          "rounded-md border bg-background p-3 transition-colors",
          error ? "border-red-500 ring-1 ring-red-400" : "border-input",
        )}
      >
        <div className="flex flex-col gap-3">
          {value ? (
            <div className="overflow-hidden rounded-md border border-border bg-muted/30">
              {kind === "image" ? (
                <img src={value} alt={label} className="h-28 w-full object-cover" />
              ) : (
                <div className="p-3">
                  <audio controls src={value} className="w-full" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 text-muted-foreground">
              <Icon className="h-6 w-6" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              id={inputId}
              type="file"
              accept={accept}
              className="sr-only"
              disabled={disabled || isLoading}
              onChange={handleChange}
            />
            <Button type="button" asChild variant="outline" disabled={disabled || isLoading}>
              <label htmlFor={inputId} className="cursor-pointer">
                {isLoading ? <Loader2 className="animate-spin" /> : <Upload />}
                {value ? "Substituir" : "Carregar"}
              </label>
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="icon" disabled={disabled || isLoading} onClick={onClear}>
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
      </div>
      {error && <AlertError errorMessage={error} />}
    </div>
  );
}
