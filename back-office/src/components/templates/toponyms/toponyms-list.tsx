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
import { ToponymResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { ToponymsFiltersTSX } from "./common/toponyms-filters";
import { useToponymActions, useToponymsFilters, useAuth, useVonalpActions } from "@/hooks";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { DetailsToponymModal, DeleteToponymModal, ToponymModal, ReviewToponymModal } from "./toponyms-modals";
import { ao_provinces } from "@/constants";
import { ButtonAddToponym } from "./common/button-add-toponym";
import { VonalpImporter } from "@/components/templates/vonalp-importer";
import { VonalpBadges, VonalpModal } from "@/components/templates/vonalp";

export function ToponymsList() {
  const { filters, page, setPage } = useToponymsFilters();
  const [debounceSearch] = useDebounce(filters.search, 200);
  const { handleEdit, handleDetails, handleDelete, handleReview } = useToponymActions();
  const { markOrUnmark } = useVonalpActions("TOPONYM");
    
  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<ToponymResponse>({
    endpoint: "/toponyms",
    queryKey: ["toponyms"],
    queryParams: { ...filters, search: debounceSearch, page },
  });

  const { user } = useAuth();

  const columns: Column<ToponymResponse>[] = [
    { key: "toponym", header: "Topónimo" },
    { 
      key: "province", 
      header: "Província",
      render: (_, item) => {
        const p = ao_provinces.find((p) => p.value === item.province);
        return <span className="text-sm text-muted-foreground">{p?.label || item.province || "—"}</span>
      }
    },
    { 
      key: "municipality", 
      header: "Município",
      render: (_, item) => {
        const province = ao_provinces.find((p) => p.value === item.province);
        const municipality = province?.municipalities.find((m) => m.value === item.municipality);
        return <span className="text-sm text-muted-foreground">{municipality?.label || item.municipality || "—"}</span>
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

        const actions: Action<ToponymResponse>[] = [
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
    return <ListPageSkeleton cols={7} />;
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
          title="Topónimos" 
          suTitle="Faça a gestão dos nomes geográficos e da sua classificação" 
        />
        <div className="flex flex-wrap items-center gap-2">
          <ButtonAddToponym />
          <VonalpImporter kind="toponyms" />
        </div>
      </div>
      <ToponymsFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<ToponymResponse>
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
          icon="MapPin"
        />
      )}

      <DetailsToponymModal />
      <DeleteToponymModal />
      <ReviewToponymModal />
      <ToponymModal action="edit" />
      <VonalpModal />
    </div>
  );
}
