import { User } from "@/hooks/auth";
import { create } from "zustand";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isFetchingProfile: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsFetchingProfile: (isFetching: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isFetchingProfile: false,
  setUser: (user) => set({ user, isLoading: false, isFetchingProfile: false }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsFetchingProfile: (isFetching) => set({ isFetchingProfile: isFetching }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("medproject.user");
    }
    set({ user: null, isLoading: false, isFetchingProfile: false });
  },
}));
