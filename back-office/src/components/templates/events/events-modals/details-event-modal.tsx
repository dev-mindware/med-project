"use client";
import { useModal, currentEventStore } from "@/stores";
import { Icon, Button, DetailRow, EmptyState, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";

export function DetailsEventModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentEvent } = currentEventStore();

  if (!currentEvent || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="Calendar" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentEvent.title}</h2>
            <ItemStatusBadge status={currentEvent.status ?? "DRAFT"} />
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
          <h3 className="font-semibold text-foreground border-b pb-2">Informações do Evento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="Título" value={currentEvent.title} />
            <DetailRow label="Slug" value={currentEvent.slug} />
            <DetailRow label="Categoria" value={currentEvent.category || "—"} />
            <DetailRow label="Localização" value={currentEvent.location || "—"} />
            <DetailRow label="Inscritos" value={currentEvent.registrationCount?.toString() || "0"} />
            <DetailRow label="Capacidade Máxima" value={currentEvent.maxRegistrations ? currentEvent.maxRegistrations.toString() : "Ilimitada"} />
            {currentEvent.startDate && (
              <DetailRow label="Data de Início" value={formatDateTime(currentEvent.startDate as string)} />
            )}
            {currentEvent.endDate && (
              <DetailRow label="Data de Fim" value={formatDateTime(currentEvent.endDate as string)} />
            )}
            {currentEvent.publishedAt && (
              <DetailRow label="Publicado em" value={formatDateTime(currentEvent.publishedAt)} />
            )}
          </div>
        </section>

        {currentEvent.description && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground border-b pb-2">Descrição</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/30 p-4 rounded-md">
              {currentEvent.description}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h3 className="font-semibold text-foreground border-b pb-2">Media</h3>
          <div className="max-w-md">
            {currentEvent.coverImageUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Capa do Evento</p>
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                  <img 
                    src={currentEvent.coverImageUrl} 
                    alt="Capa" 
                    className="object-cover w-full h-full"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                icon="ImageOff"
                title="Sem imagem de capa"
                description="Este evento não tem imagem de capa associada."
                className="mt-0"
              />
            )}
          </div>
        </section>

        {(currentEvent.createdAt || currentEvent.updatedAt || currentEvent.cancelledAt) && (
          <section className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-foreground">
              Informações Adicionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentEvent.createdAt && (
                <DetailRow
                  label="Criado em"
                  value={formatDateTime(currentEvent.createdAt as string)}
                />
              )}
              {currentEvent.updatedAt && (
                <DetailRow
                  label="Actualizado em"
                  value={formatDateTime(currentEvent.updatedAt as string)}
                />
              )}
              {currentEvent.cancelledAt && (
                <div className="col-span-2 space-y-1">
                  <DetailRow label="Cancelado em" value={formatDateTime(currentEvent.cancelledAt)} />
                  <DetailRow label="Motivo" value={currentEvent.cancellationReason || "—"} />
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
