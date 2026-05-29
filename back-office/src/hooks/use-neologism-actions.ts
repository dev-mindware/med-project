import { currentNeologismStore, useModal } from "@/stores";
import { NeologismResponse } from "@/types";

export function useNeologismActions() {
  const { openModal } = useModal();
  const { currentNeologism, setCurrentNeologism } = currentNeologismStore();

  const handleEdit = (neologism: NeologismResponse) => {
    setCurrentNeologism(neologism);
    openModal("NEOLOGISM_EDIT_MODAL");
  };

  const handleDetails = (neologism: NeologismResponse) => {
    setCurrentNeologism(neologism);
    openModal("NEOLOGISM_DETAILS_MODAL");
  };

  const handleDelete = (neologism: NeologismResponse) => {
    setCurrentNeologism(neologism);
    openModal("NEOLOGISM_DELETE_MODAL");
  };

  const handleCreate = () => {
    setCurrentNeologism(undefined);
    openModal("NEOLOGISM_ADD_MODAL");
  };

  const handleReview = (neologism: NeologismResponse) => {
    setCurrentNeologism(neologism);
    openModal("NEOLOGISM_REVIEW_MODAL");
  };

  return { handleEdit, handleDetails, handleDelete, handleCreate, handleReview, selectedNeologism: currentNeologism };
}
