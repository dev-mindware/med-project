import { BaseEntity } from "./common";

export type ReportType = "users" | "activity" | "summary";
export type ReportFormat = "xlsx" | "pdf";

export type ReportHistoryResponse = BaseEntity & {
  type: ReportType | string;
  status: string;
  url?: string | null;
  filename: string;
  parameters?: {
    format?: ReportFormat;
    title?: string;
    totalRows?: number;
    generatedAt?: string;
  } | null;
  generatedById?: string | null;
  generatedBy?: {
    name: string;
    email: string;
  } | null;
};
