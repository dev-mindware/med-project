import { VolnaTermResponse } from "@/types";
import { create } from "zustand";

interface VolnaStore {
  currentVolnaTerm: VolnaTermResponse | undefined;
  setCurrentVolnaTerm: (term: VolnaTermResponse | undefined) => void;
}

export const currentVolnaStore = create<VolnaStore>((set) => ({
  currentVolnaTerm: undefined,
  setCurrentVolnaTerm: (term) => set({ currentVolnaTerm: term }),
}));
