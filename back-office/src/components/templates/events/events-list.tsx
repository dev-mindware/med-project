"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListPageSkeleton,
  EmptyState,
  ButtonOnlyAction,
  TitleList,
  Action,
  Badge,
} from "@/components";
import { EventResponse } from "@/types";
import { formatDateTime, truncateText } from "@/utils";
import { useDebounce } from "use-debounce";
import { EventsFiltersTSX } from "./common/events-filters";
import { useEventActions, useEventsFilters } from "@/hooks";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { ReviewEventModal, DeleteEventModal, EventModal } from "./events-modals";
import { ButtonAddEvent } from "./common/button-add-event";
import { useAuth } from "@/hooks";

export function EventsList() {
  const { user } = useAuth();
  const { filters, page, setPage } = useEventsFilters();
  const [debounceSearch] = useDebounce(filters.search, 200);
  const { handleEdit, handleDetails, handleDelete, handleReview } = useEventActions();
    
  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<EventResponse>({
    endpoint: "/events",
    queryKey: ["events"],
    queryParams: { ...filters, search: debounceSearch, page },
  });

  const columns: Column<EventResponse>[] = [
    { key: "title", header: "Título",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {truncateText(item.title, 40)}
        </div>
      ) 
    },
    { key: "category", header: "Categoria" },
    { key: "registrationCount", header: "Inscritos",
      render: (_, item) => (
        <Badge>
          {item.registrationCount}/{item.maxRegistrations}
        </Badge>
      )
     },
    { key: "location", header: "Local"},
    { key: "startDate", header: "Data Início" ,
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {formatDateTime(item.startDate)}
        </div>
      )
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => {
        const status = (item as any).status || (item as any).approvalStatus || ((item as any).isActive ? "ACTIVE" : "INACTIVE");
        return <ItemStatusBadge status={status} />;
      },
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => {
        const isAdmin = user?.role === "ADMIN";
        const actions: Action<EventResponse>[] = [
          {
            label: "Ver detalhes",
            onClick: handleDetails,
            icon: "Eye",
            variant: "default" as const,
          },
        ];

        if (isAdmin) {
          actions.push(
            {
              label: "Editar",
              onClick: handleEdit,
              icon: "Pencil",
              variant: "default" as const,
            },
            { type: "separator" },
            {
              label: "Alterar Estado",
              onClick: handleReview,
              icon: "CircleCheckBig",
              variant: "default" as const,
            },
            {
              label: "Eliminar",
              onClick: handleDelete,
              icon: "Trash2",
              variant: "destructive" as const,
            }
          );
        }

        return (
          <ButtonOnlyAction
            data={item}
            actions={actions}
          />
        );
      },
    },
  ];

  if (isLoading) {
    return <ListPageSkeleton cols={7} showAction={user?.role === "ADMIN"} />;
  }

  if (isError) {
    return (
      <RequestError refetch={refetch} message="Erro ao carregar os dados" />
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <TitleList 
          title="Eventos" 
          suTitle="Faça a gestão dos eventos e actividades do portal" 
        />
        {user?.role === "ADMIN" && <ButtonAddEvent />}
      </div>
      <EventsFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<EventResponse>
          page={page}
          data={items}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum registro encontrado"
        />
      ) : (
        <EmptyState
          description="Adicione novos registros"
          title="Nenhum Registro Encontrado"
          icon="Calendar"
        />
      )}

      <DeleteEventModal />
      <ReviewEventModal />
      <EventModal action="edit" />
    </div>
  );
}
