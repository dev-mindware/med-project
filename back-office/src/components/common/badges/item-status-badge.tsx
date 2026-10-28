import { ItemStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ItemStatus | string;
  className?: string;
  onClick?: () => void;
}

export const statusMap: Record<string, string> = {
  ACTIVE: "Activo",
  ACTIVO: "Activo",
  INACTIVE: "Inactivo",
  INACTIVO: "Inactivo",
  OUT_OF_STOCK: "Sem stock",
  DRAFT: "Rascunho",
  RASCUNHO: "Rascunho",
  PENDING_APPROVAL: "Pendente",
  PENDING: "Pendente",
  PENDENTE: "Pendente",
  APPROVED: "Aprovado",
  APROVADO: "Aprovado",
  REJECTED: "Rejeitado",
  REJEITADO: "Rejeitado",
  NEEDS_CORRECTION: "Por Corrigir",
  POR_CORRIGIR: "Por Corrigir",
  ARCHIVED: "Arquivado",
  ARQUIVADO: "Arquivado",
  PUBLISHED: "Publicado",
  PUBLICADO: "Publicado",
  CANCELLED: "Cancelado",
  CANCELADO: "Cancelado",
  ATTENDED: "Presente",
  PRESENTE: "Presente",
};

export const displayStatusLabel = (status: string): string => {
  if (!status) return "----";
  const normalized = String(status).trim().toUpperCase();
  return statusMap[normalized] || statusMap[status] || status;
};

export function ItemStatusBadge({ status, className, onClick }: StatusBadgeProps) {
  let statusStyles: string;
  const normalized = String(status || "").trim().toUpperCase();

  switch (normalized) {
    case "ACTIVE":
    case "ACTIVO":
    case "APPROVED":
    case "APROVADO":
    case "PUBLISHED":
    case "PUBLICADO":
    case "ATTENDED":
    case "PRESENTE":
      statusStyles =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100";
      break;
    case "PENDING_APPROVAL":
    case "PENDING":
    case "PENDENTE":
    case "OUT_OF_STOCK":
    case "NEEDS_CORRECTION":
    case "POR_CORRIGIR":
      statusStyles =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-100";
      break;
    case "DRAFT":
    case "RASCUNHO":
    case "ARCHIVED":
    case "ARQUIVADO":
    case "INACTIVE":
    case "INACTIVO":
    case "CANCELLED":
    case "CANCELADO":
      statusStyles =
        "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200";
      break;
    case "REJECTED":
    case "REJEITADO":
      statusStyles =
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100";
      break;
    default:
      statusStyles =
        "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200";
      break;
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn(statusStyles, className)}
      onClick={onClick}
    >
      {displayStatusLabel(status as string)}
    </Badge>
  );
}
