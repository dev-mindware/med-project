import type { AssignSupervisorOperatorsData, UserData, UserResponse } from "@/types";
import { api } from "./api";

type UsersListResponse = {
  data: UserResponse[];
  total: number;
};

export const usersService = {
  listUsers: async (params?: Record<string, any>) => {
    return api.get<UsersListResponse>("/users", { params });
  },
  addUser: async (data: UserData) => {
    return api.post<UserResponse>("/users", data);
  },
  updateUser: async (id: string, data: Partial<UserData>) => {
    return api.patch<UserResponse>(`/users/${id}`, data);
  },
  deleteUser: async (id: string) => {
    return api.delete<UserResponse>(`/users/${id}`);
  },
  toggleStatus: async (id: string, data: { isActive: boolean }) => {
    return api.patch<UserResponse>(`/users/${id}/status`, data);
  },
  updateRole: async (id: string, data: { role: string }) => {
    return api.patch<UserResponse>(`/users/${id}/role`, data);
  },
  listManagedOperators: async (supervisorId: string) => {
    return api.get<UserResponse[]>(`/users/${supervisorId}/operators`);
  },
  assignManagedOperators: async (supervisorId: string, data: AssignSupervisorOperatorsData) => {
    return api.patch<UserResponse>(`/users/${supervisorId}/operators`, data);
  },
};
