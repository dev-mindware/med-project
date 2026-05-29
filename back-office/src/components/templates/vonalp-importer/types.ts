import type { z } from "zod";

export type VonalpImportKind = "entries" | "toponyms" | "anthroponyms" | "foreignisms";

export type ImportColumnType = "text" | "boolean" | "array";

export type ImportOption = {
  label: string;
  value: string;
};

export type ImportColumn = {
  key: string;
  label: string;
  required?: boolean;
  recommended?: boolean;
  aliases?: string[];
  type?: ImportColumnType;
  options?: ImportOption[];
  description?: string;
  example?: string;
};

export type ImportOptionGroup = {
  title: string;
  options: ImportOption[];
};

export type VonalpImportConfig = {
  kind: VonalpImportKind;
  title: string;
  entityLabel: string;
  endpoint: string;
  queryKey: string;
  filenamePrefix: string;
  primaryField: string;
  columns: ImportColumn[];
  schema: z.ZodTypeAny;
  optionGroups?: ImportOptionGroup[];
};

export type ImportPayloadRow = {
  rowNumber: number;
  data: Record<string, unknown>;
};

export type ImportCreatedRow = {
  rowNumber: number;
  id: string;
  label: string;
};

export type ImportErrorRow = {
  rowNumber: number;
  field?: string;
  value?: unknown;
  message: string;
};

export type ImportWarningRow = {
  rowNumber: number;
  field?: string;
  message: string;
};

export type ImportApiResult = {
  totalRows: number;
  successCount: number;
  errorCount: number;
  created: ImportCreatedRow[];
  errors: ImportErrorRow[];
};

export type ImportFinalReport = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningCount: number;
  successCount: number;
  errorCount: number;
  created: ImportCreatedRow[];
  errors: ImportErrorRow[];
  warnings: ImportWarningRow[];
};
