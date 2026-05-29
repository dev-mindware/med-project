import { currentToponymStore, useModal } from "@/stores";
import { ToponymResponse } from "@/types";
import { useToggleForeignismToponym } from "./use-toponyms";
import { useVonalpActions } from "./use-vonalp";

export function useToponymActions() {
  const { openModal } = useModal();
  const { setCurrentToponym } = currentToponymStore();

  const handleEdit = (toponym: ToponymResponse) => {
    setCurrentToponym(toponym);
    openModal("EDIT_MODAL");
  };

  const handleDetails = (toponym: ToponymResponse) => {
    setCurrentToponym(toponym);
    openModal("DETAILS_MODAL");
  };

  const handleDelete = (toponym: ToponymResponse) => {
    setCurrentToponym(toponym);
    openModal("DELETE_MODAL");
  };

  const handleCreate = () => {
    setCurrentToponym(undefined);
    openModal("ADD_MODAL");
  };

  const handleReview = (toponym: ToponymResponse) => {
    setCurrentToponym(toponym);
    openModal("REVIEW_MODAL");
  };

  const { markOrUnmark } = useVonalpActions("TOPONYM");
  const { mutateAsync: toggleForeignism } = useToggleForeignismToponym();

  const handleToggleVocabulary = async (toponym: ToponymResponse) => {
    markOrUnmark(toponym.id, "VONALP", toponym.isVocabulary);
  };

  const handleToggleForeignism = async (toponym: ToponymResponse) => {
    const action = toponym.isForeignism ? "unmark" : "mark";
    await toggleForeignism({ id: toponym.id, action });
  };

  return { 
    handleEdit, 
    handleDetails, 
    handleDelete, 
    handleCreate,
    handleReview,
    handleToggleVocabulary,
    handleToggleForeignism
  };
}
