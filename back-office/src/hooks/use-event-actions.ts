import { useRouter } from "next/navigation";
import { currentEventStore, useModal } from "@/stores";
import { EventResponse } from "@/types";

export function useEventActions() {
  const router = useRouter();
  const { openModal } = useModal();
  const { setCurrentEvent } = currentEventStore();

  const handleEdit = (event: EventResponse) => {
    setCurrentEvent(event);
    openModal("EDIT_MODAL");
  };

  const handleDetails = (event: EventResponse) => {
    router.push(`/content-management/events/details/${event.id}`);
  };

  const handleDelete = (event: EventResponse) => {
    setCurrentEvent(event);
    openModal("DELETE_MODAL");
  };

  const handleCreate = () => {
    setCurrentEvent(undefined);
    openModal("ADD_MODAL");
  };

  const handleReview = (event: EventResponse) => {
    setCurrentEvent(event);
    openModal("REVIEW_MODAL");
  };

  return { handleEdit, handleDetails, handleDelete, handleCreate, handleReview };
}
