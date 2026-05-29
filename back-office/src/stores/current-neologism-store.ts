import { NeologismResponse } from "@/types";
import { create } from "zustand";

interface NeologismStore {
  currentNeologism: NeologismResponse | undefined;
  setCurrentNeologism: (neologism: NeologismResponse | undefined) => void;
}

export const currentNeologismStore = create<NeologismStore>((set) => ({
  currentNeologism: undefined,
  setCurrentNeologism: (neologism) => set({ currentNeologism: neologism }),
}));
