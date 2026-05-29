"use client";
import { useModal, currentBlogPostStore } from "@/stores";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { BlogPostFormContent } from "./blogPost-form-content";

type BlogPostModalProps = {
  action: "add" | "edit";
};

export function BlogPostModal({ action }: BlogPostModalProps) {
  const { open, closeModal } = useModal();
  const { currentBlogPost } = currentBlogPostStore();
  
  const modalId = action === "add" ? "ADD_MODAL" : "EDIT_MODAL";
  const isOpen = open[modalId];
  const title = action === "add" ? "Adicionar Post" : "Editar Post";

  if (!isOpen) return null;

  return (
    <GlobalModal
      id={modalId}
      title={title}
      description={action === "add" ? "Crie uma nova publicação no blogue" : "Actualize os dados da publicação"}
      canClose
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal(modalId)}>
            Cancelar
          </Button>
          <ButtonSubmit form="blog-post-form">
            {action === "add" ? "Publicar" : "Guardar Alterações"}
          </ButtonSubmit>
        </div>
      }
    >
      <BlogPostFormContent action={action} currentBlogPost={currentBlogPost} />
    </GlobalModal>
  );
}
