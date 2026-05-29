import { EventResponse } from "@/types";
import { create } from "zustand";

interface EventStore {
  currentEvent: EventResponse | undefined;
  setCurrentEvent: (event: EventResponse | undefined) => void;
}

export const currentEventStore = create<EventStore>((set) => ({
  currentEvent: undefined,
  setCurrentEvent: (event) => set({ currentEvent: event }),
}));
