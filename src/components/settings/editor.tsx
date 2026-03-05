import { useSettingsStore } from "@/stores/settings-store";
import SettingsField from "../ui/settings-field";
import { Switch } from "../ui/switch";
import { useShallow } from "zustand/react/shallow";
import { FC } from "react";

interface EditorSettingsProps {
  onChange?: () => void;
  searchQuery?: string;
}

const EditorSettings: FC<EditorSettingsProps> = ({
  onChange,
  searchQuery = "",
}) => {
  const {
    showMinimap,
    setShowMinimap,
    panOnScroll,
    setPanOnScroll,
    showControls,
    setShowControls,
  } = useSettingsStore(
    useShallow((state) => ({
      showMinimap: state.show_minimap,
      panOnScroll: state.pan_on_scroll,
      showControls: state.show_controls,
      setShowMinimap: state.setShowMinimap,
      setPanOnScroll: state.setPanOnScroll,
      setShowControls: state.setShowControls,
    })),
  );

  const isMatch = (text: string) =>
    text.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <>
      {(isMatch("Show Controls") ||
        isMatch(
          "Toggle the visibility of the editor controls (zoom, fit view, etc.)",
        )) && (
        <SettingsField
          label="Show Controls"
          description="Toggle the visibility of the editor controls (zoom, fit view, etc.)"
        >
          <Switch
            checked={showControls}
            onCheckedChange={(checked) => {
              setShowControls(checked);
              onChange?.();
            }}
          />
        </SettingsField>
      )}

      {(isMatch("Show Minimap") ||
        isMatch("Toggle the visibility of the minimap in the editor")) && (
        <SettingsField
          label="Show Minimap"
          description="Toggle the visibility of the minimap in the editor"
        >
          <Switch
            checked={showMinimap}
            onCheckedChange={(checked) => {
              setShowMinimap(checked);
              onChange?.();
            }}
          />
        </SettingsField>
      )}

      {(isMatch("Pan on Scroll") ||
        isMatch("Enable or disable panning the editor when scrolling")) && (
        <SettingsField
          label="Pan on Scroll"
          description="Enable or disable panning the editor when scrolling"
        >
          <Switch
            checked={panOnScroll}
            onCheckedChange={(checked) => {
              setPanOnScroll(checked);
              onChange?.();
            }}
          />
        </SettingsField>
      )}
    </>
  );
};

export default EditorSettings;
