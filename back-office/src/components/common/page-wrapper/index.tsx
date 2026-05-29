"use client";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { NotificationBell, NotificationDetailsModal } from "@/components/common/notifications";
import { DinamicBreadcrumb } from "@/components/custom/dynamic-breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth";

type Props = {
  routePath?: string;
  routeLabel?: string;
  subRoute: string;
  showSeparator?: boolean;
  children: React.ReactNode;
};

export function PageWrapper({
  routePath,
  routeLabel,
  subRoute,
  showSeparator = true,
  children,
}: Props) {
  const { user, isLoading } = useAuth();

  return (
    <div className="bg-background flex flex-col flex-1 w-full min-h-screen">
      <header className="flex h-16 sticky top-0 z-50 shrink-0 bg-sidebar border-b items-center gap-2 transition-[width,height] ease-linear justify-between px-4">
        <div className="flex items-center gap-2 text-center">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <DinamicBreadcrumb
            routePath={routePath}
            routeLabel={routeLabel}
            subRoute={subRoute}
            showSeparator={showSeparator}
          />
        </div>

        <div className="flex items-center mr-4 space-x-2 md:space-x-4">
          <div className="flex items-center gap-4 pl-4 border-l border-border">
            <ThemeToggle />
            <NotificationBell />
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="hidden md:flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.profilePhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  />
                  <AvatarFallback className="text-xs font-semibold">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col text-start overflow-hidden">
                  <span
                    className="text-xs font-semibold truncate max-w-[120px]"
                    title={user?.name}
                  >
                    {user?.name || "Utilizador"}
                  </span>
                  <span
                    className="text-[10px] text-muted-foreground uppercase font-medium"
                    title={user?.role}
                  >
                    {user?.role || "SEM PERFIL"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col flex-1 w-full mx-auto space-y-4 md:space-y-6">
        <div className="@container/main flex flex-1 p-4 md:p-8 lg:p-12 flex-col gap-2">
          {children}
        </div>
      </div>
      <NotificationDetailsModal />
    </div>
  );
}
