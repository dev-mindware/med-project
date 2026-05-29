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
  INACTIVE: "Inactivo",
  OUT_OF_STOCK: "Sem stock",
  DRAFT: "Rascunho",
  PENDING_APPROVAL: "Pendente",
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  NEEDS_CORRECTION: "Por Corrigir",
  ARCHIVED: "Arquivado",
  PUBLISHED: "Publicado",
  CANCELLED: "Cancelado",
  ATTENDED: "Presente",
};

export const displayStatusLabel = (status: string): string => {
  if (!status) return "----";
  return statusMap[status] || status;
};

export function ItemStatusBadge({ status, className, onClick }: StatusBadgeProps) {
  let statusStyles: string;
  
  switch (status) {
    case "ACTIVE":
    case "APPROVED":
    case "PUBLISHED":
    case "ATTENDED":
      statusStyles =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100";
      break;
    case "PENDING_APPROVAL":
    case "PENDING":
    case "OUT_OF_STOCK":
    case "NEEDS_CORRECTION":
      statusStyles =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-100";
      break;
    case "DRAFT":
    case "ARCHIVED":
    case "INACTIVE":
    case "CANCELLED":
      statusStyles =
        "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200";
      break;
    case "REJECTED":
    default:
      statusStyles =
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100";
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
