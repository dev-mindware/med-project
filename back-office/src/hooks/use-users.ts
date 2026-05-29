import { UserData, UserResponse } from "@/types";
import { usersService } from "@/services/users-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useOperatorUsers(enabled = true) {
  return useQuery({
    queryKey: ["users", "operator-options"],
    queryFn: async () => {
      const response = await usersService.listUsers({
        role: "OPERATOR",
        isActive: "true",
        limit: 500,
      });

      return response.data.data ?? [];
    },
    enabled,
  });
}

export function useSupervisorOperators(supervisorId?: string, enabled = true) {
  return useQuery({
    queryKey: ["users", supervisorId, "managed-operators"],
    queryFn: async () => {
      if (!supervisorId) return [];

      const response = await usersService.listManagedOperators(supervisorId);
      return response.data;
    },
    enabled: enabled && Boolean(supervisorId),
  });
}

export function useAddUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserData) => usersService.addUser(data),
    onSuccess: () => {
      SucessMessage("Registro adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserData> }) =>
      usersService.updateUser(id, data as any),
    onSuccess: () => {
      SucessMessage("Registo actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateStatusUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { isActive: boolean } }) => 
      usersService.toggleStatus(id, data as any),
    onSuccess: () => {
      SucessMessage("Estado actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateRoleUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role: string } }) => 
      usersService.updateRole(id, data as any),
    onSuccess: () => {
      SucessMessage("Função actualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAssignSupervisorOperators() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, operatorIds }: { id: string; operatorIds: string[] }) =>
      usersService.assignManagedOperators(id, { operatorIds }),
    onSuccess: (_, variables) => {
      SucessMessage("Operadores atribuí­dos com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id, "managed-operators"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      SucessMessage("Registo eliminado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
