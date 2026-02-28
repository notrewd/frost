import { create } from "zustand/react";
import { SettingsState } from "./types";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { setTheme } from "@/managers/theme-manager";

export const useSettingsStore = create<SettingsState>(() => ({
  theme: "dark",
  pan_on_scroll: false,
  show_minimap: true,
  colored_nodes: true,
  show_controls: true,

  setTheme: (theme) => {
    invoke("set_settings_state", { theme });
  },
  setPanOnScroll: (enabled: boolean) =>
    invoke("set_settings_state", { panOnScroll: enabled }),
  setShowMinimap: (enabled: boolean) =>
    invoke("set_settings_state", { showMinimap: enabled }),
  setColoredNodes: (enabled: boolean) =>
    invoke("set_settings_state", { coloredNodes: enabled }),
  setShowControls: (enabled: boolean) =>
    invoke("set_settings_state", { showControls: enabled }),
}));

const fetchSettings = async () => {
  const settings = (await invoke("get_settings_state")) as SettingsState;

  useSettingsStore.setState({
    theme: settings.theme,
    pan_on_scroll: settings.pan_on_scroll,
    show_minimap: settings.show_minimap,
    colored_nodes: settings.colored_nodes,
    show_controls: settings.show_controls,
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
      colored_nodes: settings.coloredNodes,
      show_controls: settings.showControls,
    });

    setTheme(settings.theme);
  });
};

fetchSettings();
subscribeToSettingsUpdates();
