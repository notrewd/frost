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
  setPanOnScroll: (enabled) =>
    invoke("set_settings_state", { pan_on_scroll: enabled }),
  setShowMinimap: (enabled) =>
    invoke("set_settings_state", { show_minimap: enabled }),
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
    const settings = event.payload as SettingsState;
    useSettingsStore.setState({
      theme: settings.theme,
      pan_on_scroll: settings.pan_on_scroll,
      show_minimap: settings.show_minimap,
    });
    setTheme(settings.theme);
  });
};

fetchSettings();
subscribeToSettingsUpdates();
