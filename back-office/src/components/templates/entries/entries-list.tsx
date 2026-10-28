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
import { useState } from "react";
import { CheckCircle2, Globe, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EntriesFiltersTSX } from "./common/entries-filters";
import {
  useEntryActions,
  useEntriesFilters,
  useReviewEntry,
  useBulkReviewEntries,
  useBulkDeleteEntries,
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
  const { mutate: bulkReview, isPending: isBulkReviewing } = useBulkReviewEntries();
  const { mutate: bulkDelete, isPending: isBulkDeleting } = useBulkDeleteEntries();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<"approve" | "publish" | "reject" | "delete" | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isSupervisor = user?.role === "SUPERVISOR";
  const canBulkReview = isAdmin || isSupervisor;
  const canBulkDelete = isAdmin;

  const handleConfirmBulkAction = () => {
    if (!bulkActionType || selectedIds.length === 0) return;

    if (bulkActionType === "approve" || bulkActionType === "publish") {
      bulkReview(
        { ids: selectedIds, status: "APPROVED" },
        {
          onSuccess: () => {
            setSelectedIds([]);
            setBulkActionType(null);
          },
        }
      );
    } else if (bulkActionType === "reject") {
      bulkReview(
        { ids: selectedIds, status: "REJECTED", reason: "Rejeição em massa via painel administrativo" },
        {
          onSuccess: () => {
            setSelectedIds([]);
            setBulkActionType(null);
          },
        }
      );
    } else if (bulkActionType === "delete") {
      bulkDelete(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          setBulkActionType(null);
        },
      });
    }
  };

  const batchActions = (
    <div className="flex flex-wrap items-center gap-2">
      {canBulkReview && (
        <>
          <Button
            size="sm"
            variant="default"
            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            onClick={() => setBulkActionType("approve")}
            disabled={isBulkReviewing || isBulkDeleting}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aprovar ({selectedIds.length})
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => setBulkActionType("publish")}
            disabled={isBulkReviewing || isBulkDeleting}
          >
            <Globe className="w-3.5 h-3.5" />
            Publicar ({selectedIds.length})
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
            onClick={() => setBulkActionType("reject")}
            disabled={isBulkReviewing || isBulkDeleting}
          >
            <XCircle className="w-3.5 h-3.5" />
            Rejeitar ({selectedIds.length})
          </Button>
        </>
      )}

      {canBulkDelete && (
        <Button
          size="sm"
          variant="destructive"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setBulkActionType("delete")}
          disabled={isBulkReviewing || isBulkDeleting}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar ({selectedIds.length})
        </Button>
      )}
    </div>
  );

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

  const columns: Column<EntryResponse>[] = [
    { key: "entry", header: "Entrada" },
    { key: "syllabicDivision", header: "Divisão Silábica" },
    {
      key: "grammaticalCategory",
      header: "Categoria",
      render: (_, item) => {
        const itemCat = item.grammaticalCategory?.toLowerCase();
        const category = grammatical_category.find((c) => 
          c.value.toLowerCase() === itemCat || 
          c.label.toLowerCase() === itemCat
        );
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
          selectable={canBulkReview || canBulkDelete}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          batchActions={batchActions}
          emptyMessage="Nenhum registro encontrado"
        />
      ) : (
        <EmptyState
          description="Adicione novos registros"
          title="Nenhum Registro Encontrado"
          icon="BookA"
        />
      )}

      <AlertDialog open={!!bulkActionType} onOpenChange={(open) => !open && setBulkActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionType === "approve" && `Aprovar ${selectedIds.length} ${selectedIds.length === 1 ? "entrada seleccionada" : "entradas seleccionadas"}?`}
              {bulkActionType === "publish" && `Publicar ${selectedIds.length} ${selectedIds.length === 1 ? "entrada seleccionada" : "entradas seleccionadas"}?`}
              {bulkActionType === "reject" && `Rejeitar ${selectedIds.length} ${selectedIds.length === 1 ? "entrada seleccionada" : "entradas seleccionadas"}?`}
              {bulkActionType === "delete" && `Eliminar permanentemente ${selectedIds.length} ${selectedIds.length === 1 ? "entrada" : "entradas"}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionType === "approve" && "As entradas seleccionadas serão aprovadas e ficarão disponíveis com estado APROVADO."}
              {bulkActionType === "publish" && "As entradas seleccionadas serão aprovadas e publicadas imediatamente no portal público."}
              {bulkActionType === "reject" && "O estado de revisão das entradas seleccionadas será alterado para REJEITADO."}
              {bulkActionType === "delete" && "Esta acção é irreversível. As entradas seleccionadas serão permanentemente removidas da base de dados."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkReviewing || isBulkDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmBulkAction();
              }}
              className={
                bulkActionType === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : bulkActionType === "reject"
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }
              disabled={isBulkReviewing || isBulkDeleting}
            >
              {(isBulkReviewing || isBulkDeleting) ? "A processar..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DetailsEntryModal />
      <DeleteEntryModal />
      <ReviewEntryModal />
      <EntryModal action="edit" />
      <VonalpModal />
    </div>
  );
}
