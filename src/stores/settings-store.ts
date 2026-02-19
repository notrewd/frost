import { create } from "zustand/react";
import { SettingsState } from "./types";

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "system",
  panOnScroll: false,
  showMinimap: true,

  setTheme: (theme) => set({ theme }),
  setPanOnScroll: (enabled) => set({ panOnScroll: enabled }),
  setShowMinimap: (enabled) => set({ showMinimap: enabled }),
}));
