"use client";
import { useDebounce } from "use-debounce";
import {
  Action,
  ButtonOnlyAction,
  Column,
  EmptyState,
  GenericTable,
  ListPageSkeleton,
  RequestError,
  TitleList,
} from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { grammatical_category } from "@/constants";
import { useAuth, useVolnaActions, useVolnaFilters } from "@/hooks";
import { usePagination } from "@/hooks/common";
import { VolnaTermResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { ButtonAddVolna } from "./common/button-add-volna";
import { VolnaFiltersTSX } from "./common/volna-filters";
import { DeleteVolnaModal, DetailsVolnaModal, ReviewVolnaModal, VolnaModal } from "./volna-modals";

export function VolnaList() {
  const { user } = useAuth();
  const { filters, page, setPage } = useVolnaFilters();
  const [debounceSearch] = useDebounce(filters.search, 200);
  const { handleDetails, handleEdit, handleReview, handleDelete } = useVolnaActions();

  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<VolnaTermResponse>({
    endpoint: "/volna",
    queryKey: ["volna"],
    queryParams: { ...filters, search: debounceSearch, page },
  });

  const columns: Column<VolnaTermResponse>[] = [
    { key: "term", header: "Vocábulo" },
    { key: "language", header: "Língua nacional" },
    {
      key: "grammaticalCategory",
      header: "Classe",
      render: (_, item) => {
        const category = grammatical_category.find((entry) => entry.value === item.grammaticalCategory);
        const subcategory = category?.subcategories.find((entry) => entry.value === item.grammaticalSubcategory);
        return <span className="text-sm text-muted-foreground">{subcategory ? `${category?.label} (${subcategory.label})` : category?.label || item.grammaticalCategory || "—"}</span>;
      },
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => <span className="text-sm text-foreground">{formatDateTime(item.createdAt)}</span>,
    },
    {
      key: "approvalStatus",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.approvalStatus} />,
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => {
        const isAdmin = user?.role === "ADMIN";
        const isSupervisor = user?.role === "SUPERVISOR";
        const isOperator = user?.role === "OPERATOR";
        const isOwner = user?.id === item.createdById;
        const isDraft = item.approvalStatus === "DRAFT";
        const actions: Action<VolnaTermResponse>[] = [
          { label: "Ver detalhes", onClick: handleDetails, icon: "Eye", variant: "default" as const },
        ];

        if (isAdmin || isSupervisor || (isOperator && isOwner && isDraft)) {
          actions.push({ label: "Editar", onClick: handleEdit, icon: "Pencil", variant: "default" as const });
        }

        if (isAdmin || isSupervisor) {
          actions.push({ label: "Alterar estado", onClick: handleReview, icon: "CircleCheckBig", variant: "default" as const });
        }

        if (isAdmin || isSupervisor || (isOperator && isOwner && isDraft)) {
          actions.push({ label: "Eliminar", onClick: handleDelete, icon: "Trash2", variant: "destructive" as const });
        }

        return <ButtonOnlyAction data={item} actions={actions} />;
      },
    },
  ];

  if (isLoading) return <ListPageSkeleton cols={6} />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar os dados" />;

  return (
    <div className="mt-6 space-y-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <TitleList
          title="VOLNA"
          suTitle="Vocabulário das Línguas Nacionais de Angola"
        />
        <ButtonAddVolna />
      </div>
      <VolnaFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<VolnaTermResponse>
          page={page}
          data={items}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum vocábulo VOLNA encontrado"
        />
      ) : (
        <EmptyState
          description="Adicione vocábulos das línguas nacionais de Angola"
          title="Nenhum vocábulo VOLNA encontrado"
          icon="Languages"
        />
      )}

      <DetailsVolnaModal />
      <DeleteVolnaModal />
      <ReviewVolnaModal />
      <VolnaModal action="edit" />
    </div>
  );
}
