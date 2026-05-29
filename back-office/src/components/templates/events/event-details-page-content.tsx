"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { eventsService } from "@/services/events-service";
import { eventRegistrationsService } from "@/services/event-registrations-service";
import { 
  usePagination, 
  useURLSearchParams 
} from "@/hooks/common";
import { 
  GenericTable, 
  Column, 
  EventDetailsSkeleton,
  RequestError,
  TitleList,
  Button,
  ButtonOnlyAction,
  Icon,
  EmptyState,
  Action
} from "@/components";
import { EventResponse, EventRegistrationResponse } from "@/types";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Separator,
  Badge,
  Checkbox
} from "@/components/ui";
import { useEventRegistrationActions } from "@/hooks/use-event-registration-actions";
import { 
  EventRegistrationModal,
  DeleteEventRegistrationModal,
  DetailsEventRegistrationModal
} from "../event-registrations/event-registrations-modals";

export function EventDetailsPageContent() {
  const params = useParams<{ id?: string | string[] }>();
  const { getParam } = useURLSearchParams();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = routeId ?? getParam("id");
  const { 
    handleCreate: handleAddRegistration,
    handleEdit,
    handleDelete,
    handleDetails
  } = useEventRegistrationActions();

  const { data: event, isLoading: isLoadingEvent, isError: isErrorEvent, refetch: refetchEvent } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await eventsService.findEventById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const {
    data: registrations,
    total,
    totalPages,
    page,
    setPage,
    goToNextPage,
    goToPreviousPage,
    isLoading: isLoadingRegs,
    refetch: refetchRegs,
  } = usePagination<EventRegistrationResponse>({
    endpoint: "/event-registrations",
    queryKey: ["event-registrations", id],
    queryParams: { eventId: id, limit: 10 },
    enabled: !!id,
  });

  const handleUpdateStatus = async (regId: string, status: string) => {
    try {
      await eventRegistrationsService.updateStatus(regId, { status: status as any });
      toast.success("Inscrição actualizada!");
      refetchRegs();
    } catch (error) {
      toast.error("Erro ao actualizar inscrição");
    }
  };

  const handleToggleAttendance = async (regId: string, current: boolean) => {
    try {
      await eventRegistrationsService.markAttendance(regId, !current);
      toast.success("Presença actualizada!");
      refetchRegs();
    } catch (error) {
      toast.error("Erro ao actualizar presença");
    }
  };

  const columns: Column<EventRegistrationResponse>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "E-mail" },
    { key: "organization", header: "Organização" },
    {
      key: "attended",
      header: "Presença",
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <Checkbox 
            id={`attended-${item.id}`}
            checked={(item as any).attended} 
            onCheckedChange={() => handleToggleAttendance(item.id, (item as any).attended)}
          />
          <label htmlFor={`attended-${item.id}`} className="text-xs text-muted-foreground cursor-pointer">
            {(item as any).attended ? "Presente" : "Ausente"}
          </label>
        </div>
      )
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.status} />
    },
    {
      key: "actions",
      header: "Acções",
      render: (_, item) => {
        const actions: Action<EventRegistrationResponse>[] = [
          {
            label: "Ver detalhes",
            onClick: handleDetails,
            icon: "Eye",
            variant: "default" as const,
          },
          {
            label: "Editar",
            onClick: handleEdit,
            icon: "Pencil",
            variant: "default" as const,
          },
          { type: "separator" },
          ...(item.status === "PENDING"
            ? [
                {
                  label: "Aprovar Inscrição",
                  onClick: (i: EventRegistrationResponse) => handleUpdateStatus(i.id, "APPROVED"),
                  icon: "Check" as const,
                  variant: "default" as const,
                },
                {
                  label: "Rejeitar Inscrição",
                  onClick: (i: EventRegistrationResponse) => handleUpdateStatus(i.id, "REJECTED"),
                  icon: "X" as const,
                  variant: "default" as const,
                },
              ]
            : []),
          ...(item.status === "APPROVED"
            ? [
                {
                  label: "Mover para Pendente",
                  onClick: (i: EventRegistrationResponse) => handleUpdateStatus(i.id, "PENDING"),
                  icon: "Undo" as const,
                  variant: "default" as const,
                },
                {
                  label: "Rejeitar Inscrição",
                  onClick: (i: EventRegistrationResponse) => handleUpdateStatus(i.id, "REJECTED"),
                  icon: "X" as const,
                  variant: "default" as const,
                },
              ]
            : []),
          ...(item.status === "REJECTED"
            ? [
                {
                  label: "Mover para Pendente",
                  onClick: (i: EventRegistrationResponse) => handleUpdateStatus(i.id, "PENDING"),
                  icon: "Undo" as const,
                  variant: "default" as const,
                },
                {
                  label: "Aprovar Inscrição",
                  onClick: (i: EventRegistrationResponse) => handleUpdateStatus(i.id, "APPROVED"),
                  icon: "Check" as const,
                  variant: "default" as const,
                },
              ]
            : []),
          { type: "separator" },
          {
            label: "Eliminar",
            onClick: handleDelete,
            icon: "Trash2",
            variant: "destructive" as const,
          },
        ];

        return (
          <ButtonOnlyAction
            data={item}
            actions={actions}
          />
        );
      },
    },
  ];

  if (isLoadingEvent || isLoadingRegs) return <EventDetailsSkeleton />;
  if (isErrorEvent) return <RequestError message="Erro ao carregar evento" refetch={refetchEvent} />;
  if (!event) return <EmptyState icon="Calendar" title="Evento não encontrado" description="O evento a que está a tentar aceder não foi encontrado." />;

  return (
    <div className="space-y-8 mt-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <TitleList 
          title={event.title} 
          suTitle={`Detalhes e gestão de inscritos do evento`} 
        />
        <ItemStatusBadge status={event.status || "DRAFT"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Info" className="w-5 h-5 text-primary" />
              Informações do Evento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Localização</span>
              <p className="text-sm font-medium flex items-start gap-2">
                <Icon name="MapPin" className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                {event.location}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Início</span>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Icon name="Calendar" className="w-4 h-4 text-primary shrink-0" />
                  {formatDateTime(event.startDate)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fim</span>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Icon name="Calendar" className="w-4 h-4 text-primary shrink-0" />
                  {formatDateTime(event.endDate)}
                </p>
              </div>
            </div>

            <Separator />
            
            <div className="flex flex-wrap gap-4 justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoria</span>
                <div>
                  <Badge variant="outline" className="font-medium">{event.category || "Geral"}</Badge>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inscritos</span>
                <p className="text-sm font-bold text-primary">
                  {event.registrationCount || 0} {event.maxRegistrations ? `/ ${event.maxRegistrations}` : ""}
                </p>
              </div>
            </div>

            {event.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</span>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Users" className="w-5 h-5 text-primary" />
              Lista de Inscrições
            </CardTitle>
            <Button onClick={handleAddRegistration} size="sm" className="gap-2">
              <Icon name="Plus" className="w-4 h-4" />
              Adicionar Inscrito
            </Button>
          </CardHeader>
          <CardContent>
            {registrations.length > 0 ? (
              <GenericTable<EventRegistrationResponse>
                data={registrations}
                columns={columns}
                total={total}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                goToNextPage={goToNextPage}
                goToPreviousPage={goToPreviousPage}
              />
            ) : (
              <EmptyState 
                icon="Users"
                title="Nenhum inscrito" 
                description="Ainda não existem inscrições confirmadas ou pendentes para este evento." 
              />
            )}
          </CardContent>
        </Card>
      </div>

      <EventRegistrationModal action="add" eventId={id!} />
      <EventRegistrationModal action="edit" eventId={id!} />
      <DeleteEventRegistrationModal />
      <DetailsEventRegistrationModal />
    </div>
  );
}
