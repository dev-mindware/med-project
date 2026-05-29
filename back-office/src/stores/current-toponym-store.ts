import { ToponymResponse } from "@/types";
import { create } from "zustand";

interface ToponymStore {
  currentToponym: ToponymResponse | undefined;
  setCurrentToponym: (toponym: ToponymResponse | undefined) => void;
}

export const currentToponymStore = create<ToponymStore>((set) => ({
  currentToponym: undefined,
  setCurrentToponym: (toponym) => set({ currentToponym: toponym }),
}));
