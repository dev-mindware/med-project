import { UserResponse } from "@/types";
import { create } from "zustand";

interface UserStore {
  currentUser: UserResponse | undefined;
  setCurrentUser: (user: UserResponse | undefined) => void;
}

export const currentUserStore = create<UserStore>((set) => ({
  currentUser: undefined,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
