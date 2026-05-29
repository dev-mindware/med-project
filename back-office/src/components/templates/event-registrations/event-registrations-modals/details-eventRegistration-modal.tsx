"use client";
import { useModal, currentEventRegistrationStore } from "@/stores";
import { Icon, Button, DetailRow, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";

export function DetailsEventRegistrationModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentEventRegistration } = currentEventRegistrationStore();

  if (!currentEventRegistration || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="Ticket" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">Inscrição de {currentEventRegistration.name}</h2>
            <ItemStatusBadge status={currentEventRegistration.status} />
          </div>
        </>
      }
      className="w-full max-w-4xl"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={() => closeModal("DETAILS_MODAL")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground border-b pb-2">Informações da Inscrição</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="ID do Evento" value={currentEventRegistration.eventId} />
            <DetailRow label="Nome do Participante" value={currentEventRegistration.name} />
            <DetailRow label="Email" value={currentEventRegistration.email} />
            <DetailRow label="Telefone" value={currentEventRegistration.phone || "—"} />
            <DetailRow label="Organização" value={currentEventRegistration.organization || "—"} />
            <DetailRow label="Observações" value={currentEventRegistration.notes || "—"} />
          </div>
        </section>

        {(currentEventRegistration.createdAt || currentEventRegistration.updatedAt) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            {currentEventRegistration.createdAt && (
              <DetailRow
                label="Registrado em"
                value={formatDateTime(currentEventRegistration.createdAt as string)}
              />
            )}
            {currentEventRegistration.updatedAt && (
              <DetailRow
                label="Actualizado em"
                value={formatDateTime(currentEventRegistration.updatedAt as string)}
              />
            )}
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
