import { currentEntryStore, useModal } from "@/stores";
import { EntryResponse } from "@/types";

export function useEntryActions() {
  const { openModal } = useModal();
  const { currentEntry, setCurrentEntry } = currentEntryStore();

  const handleEdit = (entry: EntryResponse) => {
    setCurrentEntry(entry);
    openModal("EDIT_MODAL");
  };

  const handleDetails = (entry: EntryResponse) => {
    setCurrentEntry(entry);
    openModal("DETAILS_MODAL");
  };

  const handleDelete = (entry: EntryResponse) => {
    setCurrentEntry(entry);
    openModal("DELETE_MODAL");
  };

  const handleCreate = () => {
    setCurrentEntry(undefined);
    openModal("ADD_MODAL");
  };

  const handleReview = (entry: EntryResponse) => {
    setCurrentEntry(entry);
    openModal("review-entry");
  };

  return { 
    handleEdit, 
    handleDetails, 
    handleDelete, 
    handleCreate, 
    handleReview,
    selectedEntry: currentEntry 
  };
}
