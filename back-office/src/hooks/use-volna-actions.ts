import { currentVolnaStore, useModal } from "@/stores";
import { VolnaTermResponse } from "@/types";

export function useVolnaActions() {
  const { openModal } = useModal();
  const { setCurrentVolnaTerm } = currentVolnaStore();

  const handleCreate = () => {
    setCurrentVolnaTerm(undefined);
    openModal("VOLNA_ADD_MODAL");
  };

  const handleEdit = (term: VolnaTermResponse) => {
    setCurrentVolnaTerm(term);
    openModal("VOLNA_EDIT_MODAL");
  };

  const handleDetails = (term: VolnaTermResponse) => {
    setCurrentVolnaTerm(term);
    openModal("VOLNA_DETAILS_MODAL");
  };

  const handleReview = (term: VolnaTermResponse) => {
    setCurrentVolnaTerm(term);
    openModal("VOLNA_REVIEW_MODAL");
  };

  const handleDelete = (term: VolnaTermResponse) => {
    setCurrentVolnaTerm(term);
    openModal("VOLNA_DELETE_MODAL");
  };

  return { handleCreate, handleEdit, handleDetails, handleReview, handleDelete };
}
