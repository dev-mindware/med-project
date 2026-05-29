import { currentUserStore, useModal } from "@/stores";
import { UserResponse } from "@/types";

export function useUserActions() {
  const { openModal } = useModal();
  const { setCurrentUser } = currentUserStore();

  const handleEdit = (user: UserResponse) => {
    setCurrentUser(user);
    openModal("EDIT_MODAL");
  };

  const handleDetails = (user: UserResponse) => {
    setCurrentUser(user);
    openModal("DETAILS_MODAL");
  };

  const handleDelete = (user: UserResponse) => {
    setCurrentUser(user);
    openModal("DELETE_MODAL");
  };

  const handleCreate = () => {
    setCurrentUser(undefined);
    openModal("ADD_MODAL");
  };

  const handleToggleStatus = (user: UserResponse) => {
    setCurrentUser(user);
    openModal("TOGGLE_STATUS_MODAL");
  };

  const handleUpdateRole = (user: UserResponse) => {
    setCurrentUser(user);
    openModal("UPDATE_ROLE_MODAL");
  };

  const handleManageOperators = (user: UserResponse) => {
    setCurrentUser(user);
    openModal("MANAGE_OPERATORS_MODAL");
  };

  return {
    handleEdit,
    handleDetails,
    handleDelete,
    handleCreate,
    handleToggleStatus,
    handleUpdateRole,
    handleManageOperators,
  };
}
