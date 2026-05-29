"use client";
import { useModal, currentBlogPostStore } from "@/stores";
import { Icon, Button, DetailRow, EmptyState, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";

export function DetailsBlogPostModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentBlogPost } = currentBlogPostStore();

  if (!currentBlogPost || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="FileText" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentBlogPost.title}</h2>
            <ItemStatusBadge status={currentBlogPost.status} />
          </div>
        </>
      }
      className="w-full max-w-4xl"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={() => closeModal("DETAILS_MODAL")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground border-b pb-2">Informações da Publicação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="Título" value={currentBlogPost.title} />
            <DetailRow label="Slug" value={currentBlogPost.slug} />
            <DetailRow label="Resumo" value={currentBlogPost.excerpt || "—"} />
            <DetailRow label="Categoria" value={currentBlogPost.category || "—"} />
            <DetailRow label="Tipo" value={currentBlogPost.type || "—"} />
            <DetailRow label="Destaque?" value={currentBlogPost.isFeatured ? "Sim" : "Não"} />
            <DetailRow label="Tags" value={currentBlogPost.tags?.join(", ") || "—"} />
            {currentBlogPost.publishedAt && (
              <DetailRow label="Publicado em" value={formatDateTime(currentBlogPost.publishedAt)} />
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold text-foreground border-b pb-2">Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentBlogPost.coverImageUrl && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Capa</p>
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                  <img 
                    src={currentBlogPost.coverImageUrl} 
                    alt="Capa" 
                    className="object-cover w-full h-full"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              </div>
            )}
            {currentBlogPost.videoUrl && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Vídeo</p>
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                  {currentBlogPost.videoUrl.includes('youtube.com') || currentBlogPost.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={currentBlogPost.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      src={currentBlogPost.videoUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}
            {!currentBlogPost.coverImageUrl && !currentBlogPost.videoUrl && (
              <EmptyState
                icon="ImageOff"
                title="Sem media disponível"
                description="Esta publicação não tem capa nem vídeo associado."
                className="col-span-2 mt-0"
              />
            )}
          </div>
        </section>

        {currentBlogPost.content && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground border-b pb-2">Conteúdo</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/30 p-4 rounded-md">
              {currentBlogPost.content}
            </div>
          </section>
        )}

        {(currentBlogPost.createdAt || currentBlogPost.updatedAt) && (
          <section className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentBlogPost.createdAt && (
                <DetailRow
                  label="Criado em"
                  value={formatDateTime(currentBlogPost.createdAt as string)}
                />
              )}
              {currentBlogPost.updatedAt && (
                <DetailRow
                  label="Actualizado em"
                  value={formatDateTime(currentBlogPost.updatedAt as string)}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
