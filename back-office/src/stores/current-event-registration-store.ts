import { EventRegistrationResponse } from "@/types";
import { create } from "zustand";

interface EventRegistrationStore {
  currentEventRegistration: EventRegistrationResponse | undefined;
  setCurrentEventRegistration: (registration: EventRegistrationResponse | undefined) => void;
}

export const currentEventRegistrationStore = create<EventRegistrationStore>((set) => ({
  currentEventRegistration: undefined,
  setCurrentEventRegistration: (registration) => set({ currentEventRegistration: registration }),
}));
