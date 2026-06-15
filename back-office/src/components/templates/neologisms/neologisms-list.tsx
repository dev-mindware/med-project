"use client";
import { usePagination } from "@/hooks/common";
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
import { NeologismResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { useAuth, useNeologismActions, useNeologismsFilters } from "@/hooks";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { grammatical_category } from "@/constants";
import { NeologismsFiltersTSX } from "./common/neologisms-filters";
import { ButtonAddNeologism } from "./common/button-add-neologism";
import { DetailsNeologismModal } from "./neologisms-modals/details-neologism-modal";
import { DeleteNeologismModal } from "./neologisms-modals/delete-neologism-modal";
import { NeologismModal } from "./neologisms-modals/neologism-modal";
import { ReviewNeologismModal } from "./neologisms-modals/review-neologism-modal";

export function NeologismsList() {
  const { filters, page, setPage } = useNeologismsFilters();
  const [debounceSearch] = useDebounce(filters.search, 200);
  const { handleEdit, handleDetails, handleDelete, handleReview } = useNeologismActions();
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
  } = usePagination<NeologismResponse>({
    endpoint: "/neologisms",
    queryKey: ["neologisms"],
    queryParams: { ...filters, search: debounceSearch, page },
  });

  const columns: Column<NeologismResponse>[] = [
    { key: "entry", header: "Neologismo" },
    { key: "languageCode", header: "Língua", render: (_, item) => item.languageCode || "—" },
    {
      key: "grammaticalCategory",
      header: "Categoria",
      render: (_, item) => {
        const category = grammatical_category.find((c) => c.value === item.grammaticalCategory);
        const subcategory = category?.subcategories.find((s) => s.value === item.grammaticalSubcategory);
        const label = subcategory ? `${category?.label} (${subcategory.label})` : category?.label || item.grammaticalCategory || "—";
        return <span className="text-sm text-muted-foreground">{label}</span>;
      },
    },
    {
      key: "pronunciation",
      header: "Pronúncia",
      render: (_, item) => <span className="text-sm text-foreground">{item.pronunciation || "—"}</span>,
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => <span className="text-sm text-foreground">{formatDateTime(item.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.approvalStatus} />,
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => {
        const isOwner = user?.id === item.createdById;
        const isDraft = item.approvalStatus === "DRAFT";
        const isAdmin = user?.role === "ADMIN";
        const isSupervisor = user?.role === "SUPERVISOR";
        const isOperator = user?.role === "OPERATOR";
        const actions: Action<NeologismResponse>[] = [
          { label: "Ver detalhes", onClick: handleDetails, icon: "Eye", variant: "default" as const },
        ];

        if (isAdmin || isSupervisor || (isOperator && isOwner && isDraft)) {
          actions.push({ label: "Editar", onClick: handleEdit, icon: "Pencil", variant: "default" as const });
        }

        if (isAdmin || isSupervisor) {
          actions.push({ label: "Revisão", onClick: handleReview, icon: "CircleCheckBig", variant: "default" as const });
        }

        if (isAdmin || (isOperator && isOwner && isDraft)) {
          actions.push({ label: "Eliminar", onClick: handleDelete, icon: "Trash2", variant: "destructive" as const });
        }

        return <ButtonOnlyAction data={item} actions={actions} />;
      },
    },
  ];

  if (isLoading) return <ListPageSkeleton cols={7} />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar os dados" />;

  return (
    <div className="mt-6 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <TitleList
          title="Neologismos"
          suTitle="Faça a gestão dos vocábulos recentes e das novas unidades lexicais"
        />
        <ButtonAddNeologism />
      </div>
      <NeologismsFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<NeologismResponse>
          page={page}
          data={items}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum registo encontrado"
        />
      ) : (
        <EmptyState
          description="Adicione novos neologismos"
          title="Nenhum registo encontrado"
          icon="BookA"
        />
      )}

      <DetailsNeologismModal />
      <DeleteNeologismModal />
      <ReviewNeologismModal />
      <NeologismModal action="edit" />
    </div>
  );
}
