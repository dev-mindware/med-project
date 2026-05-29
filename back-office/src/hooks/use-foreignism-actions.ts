import { currentForeignismStore, useModal } from "@/stores";
import { ForeignismResponse } from "@/types";
import { useVonalpActions } from "./use-vonalp";

export function useForeignismActions() {
  const { openModal } = useModal();
  const { setCurrentForeignism } = currentForeignismStore();
  const { markOrUnmark } = useVonalpActions("FOREIGNISM");

  const handleEdit = (foreignism: ForeignismResponse) => {
    setCurrentForeignism(foreignism);
    openModal("EDIT_MODAL");
  };

  const handleDetails = (foreignism: ForeignismResponse) => {
    setCurrentForeignism(foreignism);
    openModal("DETAILS_MODAL");
  };

  const handleDelete = (foreignism: ForeignismResponse) => {
    setCurrentForeignism(foreignism);
    openModal("DELETE_MODAL");
  };

  const handleCreate = () => {
    setCurrentForeignism(undefined);
    openModal("ADD_MODAL");
  };

  const handleReview = (foreignism: ForeignismResponse) => {
    setCurrentForeignism(foreignism);
    openModal("REVIEW_MODAL");
  };

  const handleToggleVocabulary = (foreignism: ForeignismResponse) => {
    markOrUnmark(foreignism.id, "VONALP", foreignism.isVocabulary);
  };

  return { 
    handleEdit, 
    handleDetails, 
    handleDelete, 
    handleCreate,
    handleReview,
    handleToggleVocabulary,
  };
}
