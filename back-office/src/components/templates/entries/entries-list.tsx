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
} from "@/components";
import { EntryResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { EntriesFiltersTSX } from "./common/entries-filters";
import {
  useEntryActions,
  useEntriesFilters,
  useReviewEntry,
  useAuth,
  useVonalpActions,
} from "@/hooks";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { DetailsEntryModal, DeleteEntryModal, EntryModal } from "./entries-modals";
import { ReviewEntryModal } from "./common/review-entry-modal";
import { ButtonAddEntry } from "./common/button-add-entry";
import { grammatical_category } from "@/constants";
import { VonalpImporter } from "@/components/templates/vonalp-importer";
import { VonalpBadges, VonalpModal } from "@/components/templates/vonalp";

export function EntriesList() {
  const { filters, page, setPage } = useEntriesFilters();
  const { handleEdit, handleDetails, handleDelete, handleReview } = useEntryActions();
  const { markOrUnmark } = useVonalpActions("ENTRY");
  const { mutate: reviewEntry } = useReviewEntry();

  const cleanQueryParams = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );

  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<EntryResponse>({
    endpoint: "/entries",
    queryKey: ["entries"],
    queryParams: {
      ...cleanQueryParams,
      page,
      limit: filters.limit || 20,
    },
  });

  const { user } = useAuth();

  const columns: Column<EntryResponse>[] = [
    { key: "entry", header: "Entrada" },
    { key: "syllabicDivision", header: "Divisão Silábica" },
    {
      key: "grammaticalCategory",
      header: "Categoria",
      render: (_, item) => {
        const category = grammatical_category.find((c) => c.value === item.grammaticalCategory);
        const subcategory = category?.subcategories.find((s) => s.value === item.grammaticalSubcategory);
        
        const label = subcategory 
          ? `${category?.label} (${subcategory.label})`
          : category?.label || item.grammaticalCategory || "—";

        return (
          <span className="text-sm text-muted-foreground">
            {label}
          </span>
        );
      },
    },
    {
      key: "pronunciation",
      header: "Pronúncia",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {item.pronunciation || "—"}
        </div>
      ),
    },
    {
      key: "frequency",
      header: "Frequência",
      render: (_, item) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          {item.frequency || 1}×
        </span>
      ),
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
      key: "status",
      header: "Estado",
      render: (_, item) => {
        const status = item.approvalStatus || (item as any).status || ((item as any).isActive ? "ACTIVE" : "INACTIVE");
        return <ItemStatusBadge status={status} />;
      },
    },
    {
      key: "vonalp",
      header: "Vocabulário",
      render: (_, item) => (
        <VonalpBadges
          isVocabulary={item.isVocabulary}
          isVocabularyEP={item.isVocabularyEP}
          vonalpCompletionStatus={item.vonalpCompletionStatus}
          vonalpEpCompletionStatus={item.vonalpEpCompletionStatus}
        />
      ),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => {
        const actions: Action<EntryResponse>[] = [
          {
            label: "Ver detalhes",
            onClick: handleDetails,
            icon: "Eye",
            variant: "default" as const,
          },
        ];

        const isOwner = user?.id === item.createdById;
        const isDraft = item.approvalStatus === "DRAFT";
        const isAdmin = user?.role === "ADMIN";
        const isSupervisor = user?.role === "SUPERVISOR";
        const isOperator = user?.role === "OPERATOR";

        // Edit Rule: ADMIN, SUPERVISOR or (OPERATOR + Owner + DRAFT)
        if (isAdmin || isSupervisor || (isOperator && isOwner && isDraft)) {
          actions.push({
            label: "Editar",
            onClick: handleEdit,
            icon: "Pencil",
            variant: "default" as const,
          });
        }

        if (isAdmin || isSupervisor) {
          actions.push(
            {
              label: "Revisão",
              onClick: handleReview,
              icon: "CircleCheckBig",
              variant: "default" as const,
            }
          );
        }

        actions.push(
          {
            label: item.isVocabulary ? "Remover VONALP" : "Marcar VONALP",
            onClick: (current) => markOrUnmark(current.id, "VONALP", current.isVocabulary),
            icon: item.isVocabulary ? "BookmarkX" : "BookmarkPlus",
            variant: "default" as const,
          },
          {
            label: item.isVocabularyEP ? "Remover VONALP-EP" : "Marcar VONALP-EP",
            onClick: (current) => markOrUnmark(current.id, "VONALP_EP", current.isVocabularyEP),
            icon: item.isVocabularyEP ? "BookmarkX" : "BookmarkPlus",
            variant: "default" as const,
          },
        );

        // Delete Rule: ADMIN or (OPERATOR + Owner + DRAFT)
        if (isAdmin || (isOperator && isOwner && isDraft)) {
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
    return <ListPageSkeleton cols={9} />;
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
          title="Entradas" 
          suTitle="Faça a gestão do glossário e do dicionário" 
        />
        <div className="flex flex-wrap items-center gap-2">
          <ButtonAddEntry />
          <VonalpImporter kind="entries" />
        </div>
      </div>
      <EntriesFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<EntryResponse>
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
          icon="BookA"
        />
      )}

      <DetailsEntryModal />
      <DeleteEntryModal />
      <ReviewEntryModal />
      <EntryModal action="edit" />
      <VonalpModal />
    </div>
  );
}
