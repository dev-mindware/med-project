import { UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ItemRoleBadgeProps {
  role: UserRole;
  className?: string;
  onClick?: () => void;
}

export const roleMap: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
};

export const displayRoleLabel = (role: string): string => {
  if (!role) return "----";
  return roleMap[role] || role;
};

export function ItemRoleBadge({ role, className, onClick }: ItemRoleBadgeProps) {
  let roleStyles: string;
  
  switch (role) {
    case "ADMIN":
      roleStyles =
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100";
      break;
    case "SUPERVISOR":
      roleStyles =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100";
      break;
    case "OPERATOR":
      roleStyles =
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100";
      break;
    default:
      roleStyles =
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200";
      break;
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn(roleStyles, className)}
      onClick={onClick}
    >
      {displayRoleLabel(role as string)}
    </Badge>
  );
}
