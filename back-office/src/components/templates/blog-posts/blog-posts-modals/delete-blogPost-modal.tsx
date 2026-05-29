"use client";
import { Button, GlobalModal } from "@/components";
import { currentBlogPostStore, useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { useDeleteBlogPost } from "@/hooks";

export function DeleteBlogPostModal() {
  const { closeModal, open } = useModal();
  const { currentBlogPost } = currentBlogPostStore();
  const { mutateAsync: deleteBlogPost, isPending } = useDeleteBlogPost();

  const isOpen = open["DELETE_MODAL"];

  async function onSubmit() {
    if (!currentBlogPost) return;
    try {
      await deleteBlogPost(currentBlogPost.id);
      closeModal("DELETE_MODAL");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Ocorreu um erro ao eliminar"
      );
    }
  }

  return (
    <GlobalModal
      title="Eliminar publicação"
      description="Tem a certeza de que pretende eliminar? Esta acção não pode ser desfeita."
      id="DELETE_MODAL"
      className="!w-max"
    >
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={() => closeModal("DELETE_MODAL")} disabled={isPending}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onSubmit} loading={isPending}>
          Eliminar
        </Button>
      </div>
    </GlobalModal>
  );
}
