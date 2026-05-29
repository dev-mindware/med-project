import { api } from "./api";
import { User } from "@/hooks/auth";

export const authService = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get("/auth/profile");
    return data;
  },
  updateProfile: async (payload: { name?: string; profilePhotoUrl?: string | null }): Promise<User> => {
    const { data } = await api.patch("/auth/profile", payload);
    return data;
  },
  updateEmail: async (payload: { email: string }): Promise<User> => {
    const { data } = await api.patch("/auth/email", payload);
    return data;
  },
  updatePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<User> => {
    const { data } = await api.patch("/auth/password", payload);
    return data;
  },
};
