import { EntryResponse } from "@/types";
import { create } from "zustand";

interface EntryStore {
  currentEntry: EntryResponse | undefined;
  setCurrentEntry: (entry: EntryResponse | undefined) => void;
}

export const currentEntryStore = create<EntryStore>((set) => ({
  currentEntry: undefined,
  setCurrentEntry: (entry) => set({ currentEntry: entry }),
}));
