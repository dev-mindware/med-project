import { currentEventRegistrationStore, useModal } from "@/stores";
import { EventRegistrationResponse } from "@/types";
import { ErrorMessage } from "@/utils/messages";
import { useToggleAttendanceEventRegistration } from "./use-event-registrations";

export function useEventRegistrationActions() {
  const { openModal } = useModal();
  const { setCurrentEventRegistration } = currentEventRegistrationStore();
  const { mutateAsync: toggleAttendance } = useToggleAttendanceEventRegistration();

  const handleEdit = (eventRegistration: EventRegistrationResponse) => {
    setCurrentEventRegistration(eventRegistration);
    openModal("EDIT_MODAL");
  };

  const handleDetails = (eventRegistration: EventRegistrationResponse) => {
    setCurrentEventRegistration(eventRegistration);
    openModal("DETAILS_MODAL");
  };

  const handleDelete = (eventRegistration: EventRegistrationResponse) => {
    setCurrentEventRegistration(eventRegistration);
    openModal("DELETE_MODAL");
  };

  const handleReview = (eventRegistration: EventRegistrationResponse) => {
    setCurrentEventRegistration(eventRegistration);
    openModal("REVIEW_MODAL");
  };

  const handleToggleAttendance = async (eventRegistration: EventRegistrationResponse) => {
    if (eventRegistration.status !== "APPROVED") {
      ErrorMessage("Só é possível marcar presença em inscrições aprovadas.");
      return;
    }
    
    await toggleAttendance({ 
      id: eventRegistration.id, 
      attended: !eventRegistration.attended 
    });
  };

  const handleCreate = () => {
    setCurrentEventRegistration(undefined);
    openModal("ADD_MODAL");
  };

  return { 
    handleEdit, 
    handleDetails, 
    handleDelete, 
    handleCreate, 
    handleReview, 
    handleToggleAttendance 
  };
}
