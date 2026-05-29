import { AnthroponymResponse } from "@/types";
import { create } from "zustand";

interface AnthroponymStore {
  currentAnthroponym: AnthroponymResponse | undefined;
  setCurrentAnthroponym: (anthroponym: AnthroponymResponse | undefined) => void;
}

export const currentAnthroponymStore = create<AnthroponymStore>((set) => ({
  currentAnthroponym: undefined,
  setCurrentAnthroponym: (anthroponym) => set({ currentAnthroponym: anthroponym }),
}));
