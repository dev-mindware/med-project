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
import { AnthroponymResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { AnthroponymsFiltersTSX } from "./common/anthroponyms-filters";
import { useAnthroponymActions, useAnthroponymsFilters, useAuth, useVonalpActions } from "@/hooks";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { DetailsAnthroponymModal, DeleteAnthroponymModal, AnthroponymModal, ReviewAnthroponymModal } from "./anthroponyms-modals";
import { gender } from "@/constants";
import { ButtonAddAnthroponym } from "./common/button-add-anthroponym";
import { VonalpImporter } from "@/components/templates/vonalp-importer";
import { VonalpBadges, VonalpModal } from "@/components/templates/vonalp";

export function AnthroponymsList() {
  const { filters, page, setPage } = useAnthroponymsFilters();
  const [debounceSearch] = useDebounce(filters.search, 200);
  const { handleEdit, handleDetails, handleDelete, handleReview } = useAnthroponymActions();
  const { markOrUnmark } = useVonalpActions("ANTHROPONYM");
    
  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<AnthroponymResponse>({
    endpoint: "/anthroponyms",
    queryKey: ["anthroponyms"],
    queryParams: { ...filters, search: debounceSearch, page },
  });

  const { user } = useAuth();

  const columns: Column<AnthroponymResponse>[] = [
    { key: "name", header: "Nome" },
    { 
      key: "gender", 
      header: "Gênero",
      render: (_, item) => {
        const g = gender.find((g) => g.value === item.gender);
        return <span className="text-sm text-muted-foreground">{g?.label || item.gender || "—"}</span>
      }
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
        const status = (item as any).status || (item as any).approvalStatus || ((item as any).isActive ? "ACTIVE" : "INACTIVE");
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
        const isOwner = user?.id === item.createdById;
        const isDraft = item.approvalStatus === "DRAFT";
        const isAdmin = user?.role === "ADMIN";
        const isSupervisor = user?.role === "SUPERVISOR";
        const isOperator = user?.role === "OPERATOR";

        const actions: Action<AnthroponymResponse>[] = [
          {
            label: "Ver detalhes",
            onClick: handleDetails,
            icon: "Eye",
            variant: "default" as const,
          },
        ];

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
    return <ListPageSkeleton cols={6} />;
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
          title="Antropónimos" 
          suTitle="Faça a gestão dos nomes próprios e da sua origem" 
        />
        <div className="flex flex-wrap items-center gap-2">
          <ButtonAddAnthroponym />
          <VonalpImporter kind="anthroponyms" />
        </div>
      </div>
      <AnthroponymsFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<AnthroponymResponse>
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
          icon="User"
        />
      )}

      <DetailsAnthroponymModal />
      <DeleteAnthroponymModal />
      <ReviewAnthroponymModal />
      <AnthroponymModal action="edit" />
      <VonalpModal />
    </div>
  );
}
