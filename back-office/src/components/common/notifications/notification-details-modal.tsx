"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button, GlobalModal, Icon } from "@/components";
import { useModal } from "@/stores";
import { NotificationResponse } from "@/types";

export function NotificationDetailsModal() {
  const { closeModal, modalData, open } = useModal();
  const notification = modalData["NOTIFICATION_DETAILS_MODAL"] as NotificationResponse | undefined;
  const isOpen = open["NOTIFICATION_DETAILS_MODAL"];

  if (!notification || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="NOTIFICATION_DETAILS_MODAL"
      className="w-full max-w-xl"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
            <Icon name="Bell" className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{notification.title}</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex w-full justify-end">
          <Button variant="outline" onClick={() => closeModal("NOTIFICATION_DETAILS_MODAL")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Descrição</p>
        <p className="mt-2 text-sm leading-6 text-foreground">{notification.message}</p>
      </div>
    </GlobalModal>
  );
}
