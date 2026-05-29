"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks";
import { useModal } from "@/stores";
import { NotificationResponse } from "@/types";

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const { data: unread } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const { openModal } = useModal();
  const unreadCount = unread?.count || 0;

  const openNotification = async (notification: NotificationResponse) => {
    if (!notification.readAt) {
      await markAsRead.mutateAsync(notification.id);
    }
    openModal("NOTIFICATION_DETAILS_MODAL", notification);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => markAllAsRead.mutate()}>
              Marcar lidas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[360px] overflow-y-auto p-1">
          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              Sem notificações recentes.
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex cursor-pointer items-start gap-3 rounded-md p-3"
                onClick={() => openNotification(notification)}
              >
                <span className={`mt-1 h-2 w-2 rounded-full ${notification.readAt ? "bg-muted" : "bg-primary"}`} />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium">{notification.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
