import { create } from "zustand/react";
import { SettingsState } from "./types";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { setTheme } from "@/managers/theme-manager";

export const useSettingsStore = create<SettingsState>(() => ({
  theme: "dark",
  pan_on_scroll: false,
  show_minimap: true,

  setTheme: (theme) => {
    invoke("set_settings_state", { theme });
  },
  setPanOnScroll: (enabled: boolean) =>
    invoke("set_settings_state", { panOnScroll: enabled }),
  setShowMinimap: (enabled: boolean) =>
    invoke("set_settings_state", { showMinimap: enabled }),
}));

const fetchSettings = async () => {
  const settings = (await invoke("get_settings_state")) as SettingsState;

  useSettingsStore.setState({
    theme: settings.theme,
    pan_on_scroll: settings.pan_on_scroll,
    show_minimap: settings.show_minimap,
  });

  setTheme(settings.theme);
};

const subscribeToSettingsUpdates = () => {
  listen("settings-updated", (event) => {
    const settings = event.payload as any;

    useSettingsStore.setState({
      theme: settings.theme,
      pan_on_scroll: settings.panOnScroll,
      show_minimap: settings.showMinimap,
    });
    setTheme(settings.theme);
  });
};

fetchSettings();
subscribeToSettingsUpdates();
