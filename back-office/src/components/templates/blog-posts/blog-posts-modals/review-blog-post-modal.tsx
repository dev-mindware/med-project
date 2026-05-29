"use client";
import { GlobalModal, Button, ButtonSubmit } from "@/components";
import { ReviewBlogPostFormContent } from "./review-blog-post-form-content";
import { currentBlogPostStore, useModal } from "@/stores";

export function ReviewBlogPostModal() {
  const { currentBlogPost } = currentBlogPostStore();
  const { closeModal } = useModal();

  if (!currentBlogPost) return null;

  return (
    <GlobalModal
      id="REVIEW_MODAL"
      title={`Alterar Estado`}
      description="Seleccione o novo estado para este artigo do blogue."
      className="!w-max"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => closeModal("REVIEW_MODAL")}>
            Cancelar
          </Button>
          <ButtonSubmit form="review-blog-post-form">
            Actualizar Estado
          </ButtonSubmit>
        </div>
      }
    >
      <ReviewBlogPostFormContent blogPost={currentBlogPost} />
    </GlobalModal>
  );
}
