"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListPageSkeleton,
  EmptyState,
  ButtonOnlyAction,
  Action,
} from "@/components";
import { EventRegistrationResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { EventRegistrationsFiltersTSX } from "./common/event-registrations-filters";
import { useEventRegistrationActions, useEventRegistrationsFilters } from "@/hooks";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { DetailsEventRegistrationModal, DeleteEventRegistrationModal, EventRegistrationModal, ReviewEventRegistrationModal } from "./event-registrations-modals";
import { useAuth } from "@/hooks";

export function EventRegistrationsList() {
  const { filters, page, setPage } = useEventRegistrationsFilters();
  const [debounceSearch] = useDebounce(filters.search, 200);
  const { handleEdit, handleDetails, handleDelete, handleReview, handleToggleAttendance } = useEventRegistrationActions();
  const { user } = useAuth();
    
  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<EventRegistrationResponse>({
    endpoint: "/event-registrations",
    queryKey: ["event-registrations"],
    queryParams: { ...filters, search: debounceSearch, page },
  });

    const isAdmin = user?.role === "ADMIN";
    const isSupervisor = user?.role === "SUPERVISOR";
    const canManage = isAdmin || isSupervisor;

  const columns: Column<EventRegistrationResponse>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    {
      key: "attended",
      header: "Presença",
      render: (_, item) => (
        <div className="flex items-center justify-center">
          <ItemStatusBadge 
            status={item.attended ? "ATTENDED" : "PENDING"} 
            className={cn(
              "transition-opacity",
              canManage ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-70"
            )}
            onClick={() => canManage && handleToggleAttendance(item)}
          />
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => {
        const status = (item as any).status || (item as any).approvalStatus || "PENDING";
        return <ItemStatusBadge status={status} />;
      },
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {formatDateTime(item.createdAt)}
        </div>
      ),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => {
        const actions: Action<EventRegistrationResponse>[] = [
          {
            label: "Ver detalhes",
            onClick: handleDetails,
            icon: "Eye",
            variant: "default" as const,
          },
        ];

        if (canManage) {
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
            }
          );
        }

        if (isAdmin) {
          actions.push({
            label: "Eliminar",
            onClick: handleDelete,
            icon: "Trash2",
            variant: "destructive" as const,
          });
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
    return <ListPageSkeleton cols={6} showTitle={false} />;
  }

  if (isError) {
    return (
      <RequestError refetch={refetch} message="Erro ao carregar os dados" />
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <EventRegistrationsFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<EventRegistrationResponse>
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
          icon="Ticket"
        />
      )}

      <DetailsEventRegistrationModal />
      <DeleteEventRegistrationModal />
      <ReviewEventRegistrationModal />
      <EventRegistrationModal action="edit" />
    </div>
  );
}
