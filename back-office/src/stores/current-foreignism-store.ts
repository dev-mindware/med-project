import { ForeignismResponse } from "@/types";
import { create } from "zustand";

interface ForeignismStore {
  currentForeignism: ForeignismResponse | undefined;
  setCurrentForeignism: (foreignism: ForeignismResponse | undefined) => void;
}

export const currentForeignismStore = create<ForeignismStore>((set) => ({
  currentForeignism: undefined,
  setCurrentForeignism: (foreignism) => set({ currentForeignism: foreignism }),
}));
