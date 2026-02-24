import { useSettingsStore } from "@/stores/settings-store";
import SettingsField from "../ui/settings-field";
import { Switch } from "../ui/switch";
import { useShallow } from "zustand/react/shallow";
import { FC } from "react";

interface EditorSettingsProps {
  onChange?: () => void;
}

const EditorSettings: FC<EditorSettingsProps> = ({ onChange }) => {
  const { showMinimap, setShowMinimap, panOnScroll, setPanOnScroll } =
    useSettingsStore(
      useShallow((state) => ({
        showMinimap: state.show_minimap,
        panOnScroll: state.pan_on_scroll,
        setShowMinimap: state.setShowMinimap,
        setPanOnScroll: state.setPanOnScroll,
      })),
    );

  return (
    <>
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
    </>
  );
};

export default EditorSettings;
