import { currentAnthroponymStore, useModal } from "@/stores";
import { AnthroponymResponse } from "@/types";
import { useToggleForeignismAnthroponym } from "./use-anthroponyms";
import { useVonalpActions } from "./use-vonalp";

export function useAnthroponymActions() {
  const { openModal } = useModal();
  const { setCurrentAnthroponym } = currentAnthroponymStore();
  const { markOrUnmark } = useVonalpActions("ANTHROPONYM");
  const { mutate: toggleForeignism } = useToggleForeignismAnthroponym();

  const handleEdit = (anthroponym: AnthroponymResponse) => {
    setCurrentAnthroponym(anthroponym);
    openModal("EDIT_MODAL");
  };

  const handleDetails = (anthroponym: AnthroponymResponse) => {
    setCurrentAnthroponym(anthroponym);
    openModal("DETAILS_MODAL");
  };

  const handleDelete = (anthroponym: AnthroponymResponse) => {
    setCurrentAnthroponym(anthroponym);
    openModal("DELETE_MODAL");
  };

  const handleCreate = () => {
    setCurrentAnthroponym(undefined);
    openModal("ADD_MODAL");
  };

  const handleReview = (anthroponym: AnthroponymResponse) => {
    setCurrentAnthroponym(anthroponym);
    openModal("REVIEW_MODAL");
  };

  const handleToggleVocabulary = (anthroponym: AnthroponymResponse) => {
    markOrUnmark(anthroponym.id, "VONALP", anthroponym.isVocabulary);
  };

  const handleToggleForeignism = (anthroponym: AnthroponymResponse) => {
    toggleForeignism({ id: anthroponym.id, action: anthroponym.isForeignism ? "unmark" : "mark" });
  };

  return { 
    handleEdit, 
    handleDetails, 
    handleDelete, 
    handleCreate,
    handleReview,
    handleToggleVocabulary,
    handleToggleForeignism,
  };
}
