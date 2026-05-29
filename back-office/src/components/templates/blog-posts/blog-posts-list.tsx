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
import { BlogPostResponse } from "@/types";
import { formatDateTime, truncateText } from "@/utils";
import { useDebounce } from "use-debounce";
import { BlogPostsFiltersTSX } from "./common/blog-posts-filters";
import { useBlogPostActions, useBlogPostsFilters } from "@/hooks";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { DetailsBlogPostModal, DeleteBlogPostModal, BlogPostModal, ReviewBlogPostModal } from "./blog-posts-modals";
import { ButtonAddBlogPost } from "./common/button-add-blogPost";
import { useAuth } from "@/hooks";

export function BlogPostsList() {
  const { user } = useAuth();
  const { filters, page, setPage } = useBlogPostsFilters();
  const [debounceSearch] = useDebounce(filters.search, 200);
  const { handleEdit, handleDetails, handleDelete, handleReview } = useBlogPostActions();
    
  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<BlogPostResponse>({
    endpoint: "/blog-posts",
    queryKey: ["blog-posts"],
    queryParams: { ...filters, search: debounceSearch, page },
  });

  const columns: Column<BlogPostResponse>[] = [
    { key: "title", header: "Título",
    render: (_, item) => (
      <div className="text-sm text-foreground">
        {truncateText(item.title, 60)}
      </div>
    ) 
    },
    { 
      key: "type", 
      header: "Tipo",
      render: (_, item) => {
        const typeMap: Record<string, string> = {
          ARTICLE: "Artigo",
          VIDEO: "Vídeo",
          IMAGE: "Imagem",
          EVENT_COVERAGE: "Cobertura de Evento",
          ANNOUNCEMENT: "Anúncio",
        };
        return typeMap[item.type] || item.type;
      }
    },
    { key: "category", header: "Categoria" },
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
      key: "action",
      header: "Acção",
      render: (_, item) => {
        const isAdmin = user?.role === "ADMIN";
        const actions: Action<BlogPostResponse>[] = [
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
    return <ListPageSkeleton cols={6} showAction={user?.role === "ADMIN"} />;
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
          title="Blog Posts" 
          suTitle="Faça a gestão dos artigos e notícias do portal" 
        />
        {user?.role === "ADMIN" && <ButtonAddBlogPost />}
      </div>
      <BlogPostsFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<BlogPostResponse>
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
          icon="FileText"
        />
      )}

      <DetailsBlogPostModal />
      <DeleteBlogPostModal />
      <ReviewBlogPostModal />
      <BlogPostModal action="edit" />
    </div>
  );
}
