"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListPageSkeleton,
  EmptyState,
  ButtonOnlyAction,
  TitleList,
} from "@/components";
import { UserResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { UsersFiltersTSX } from "./common/users-filters";
import { useUserActions, useUsersFilters } from "@/hooks";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { DetailsUserModal, DeleteUserModal, UserModal, ToggleStatusUserModal, UpdateRoleUserModal, ManageOperatorsUserModal } from "./users-modals";
import { ButtonAddUser } from "./common/button-add-user";
import { ItemRoleBadge } from "@/components/common/badges";

export function UsersList() {
  const { filters, page, setPage } = useUsersFilters();
  const [debounceSearch] = useDebounce(filters.search, 200);
  const {
    handleEdit,
    handleDetails,
    handleDelete,
    handleToggleStatus,
    handleUpdateRole,
    handleManageOperators,
  } = useUserActions();
    
  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<UserResponse>({
    endpoint: "/users",
    queryKey: ["users"],
    queryParams: { ...filters, search: debounceSearch, page },
  });

  const columns: Column<UserResponse>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    { key: "role", header: "Função", 
      render: (_, item) => {
        const role = (item as any).role || (item as any).role;
        return <ItemRoleBadge role={role} />;
      },
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {formatDateTime(item.createdAt)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => {
        const status = (item as any).status || (item as any).approvalStatus || ((item as any).isActive ? "ACTIVE" : "INACTIVE");
        return <ItemStatusBadge status={status} />;
      },
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Ver detalhes",
              onClick: handleDetails,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: handleEdit,
              icon: "Pencil",
              variant: "default",
            },
            {
              label: "Mudar Role",
              onClick: handleUpdateRole,
              icon: "ShieldAlert",
              variant: "default",
            },
            ...(item.role === "SUPERVISOR"
              ? [
                  {
                    label: "Gerir operadores",
                    onClick: handleManageOperators,
                    icon: "UsersRound" as const,
                    variant: "default" as const,
                  },
                ]
              : []),
            {
              label: item.isActive ? "Desactivar" : "Activar",
              onClick: handleToggleStatus,
              icon: item.isActive ? "UserX" : "UserCheck",
              variant: item.isActive ? "destructive" : "default",
            },
            {
              label: "Eliminar",
              onClick: handleDelete,
              icon: "Trash2",
              variant: "destructive",
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading) {
    return <ListPageSkeleton cols={6} />;
  }

  if (isError) {
    return (
      <RequestError refetch={refetch} message="Erro ao carregar os dados" />
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <TitleList 
          title="Utilizadores" 
          suTitle="Faça a gestão dos utilizadores e dos níveis de acesso" 
        />
        <ButtonAddUser />
      </div>
      <UsersFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<UserResponse>
          page={page}
          data={items}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum registro encontrado"
        />
      ) : (
        <EmptyState
          description="Adicione novos registros"
          title="Nenhum Registro Encontrado"
          icon="Users"
        />
      )}

      <DetailsUserModal />
      <DeleteUserModal />
      <ToggleStatusUserModal />
      <UpdateRoleUserModal />
      <ManageOperatorsUserModal />
      <UserModal action="add" />
      <UserModal action="edit" />
    </div>
  );
}
