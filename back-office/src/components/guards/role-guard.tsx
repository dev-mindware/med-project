"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { menuItems } from "@/constants";
import { UserRole } from "@/types";
import { ProtectedContentSkeleton } from "@/components/common";

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // O utilizador não está logado, deixamos que o middleware/layout de login resolva,
      // mas por via das dúvidas não renderizamos o conteúdo protegido
      setIsAuthorized(false);
      router.replace("/auth/login");
      return;
    }

    const checkAccess = () => {
      // Se for ADMIN, tem acesso a tudo
      if (user.role === "ADMIN") return true;

      // Primeiro, procura a rota exata ou subrota no menu
      for (const item of menuItems.items) {
        // Se a rota atual começar pela URL do item principal (desde que não seja '#')
        if (item.url !== "#" && pathname.startsWith(item.url)) {
          // Se for exato ou uma subrota de um item principal sem 'items' definidos
          return item.roles?.includes(user.role as UserRole) ?? false;
        }

        if (item.items) {
          for (const subItem of item.items) {
            // Se for uma subrota declarada explicitamente, como /entries/123
            if (pathname.startsWith(subItem.url)) {
              // Verifica se a permissão está definida no subitem ou herda do pai
              const allowedRoles = subItem.roles || item.roles;
              return allowedRoles?.includes(user.role as UserRole) ?? false;
            }
          }
        }
      }

      // Se a rota não estiver mapeada no menuItems, permitimos o acesso
      // e confiamos na protecção de componentes/backend.
      return true;
    };

    const hasAccess = checkAccess();
    setIsAuthorized(hasAccess);

    if (!hasAccess) {
      // Se não tiver acesso, redireciona para a página principal permitida (Dashboard)
      router.replace("/dashboard");
    }
  }, [pathname, user, isLoading, router]);

  if (isLoading || isAuthorized === null) {
    return <ProtectedContentSkeleton />;
  }

  if (isAuthorized === false) {
    return null;
  }

  return <>{children}</>;
}
