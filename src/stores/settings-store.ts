import { create } from "zustand/react";
import { SettingsState } from "./types";
import { emit } from "@tauri-apps/api/event";

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "dark",
  panOnScroll: false,
  showMinimap: true,

  setTheme: (theme) => {
    emit("theme-changed", { theme });
    set({ theme });
  },
  setPanOnScroll: (enabled) => set({ panOnScroll: enabled }),
  setShowMinimap: (enabled) => set({ showMinimap: enabled }),
}));
