import SettingsField from "../ui/settings-field";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/stores/settings-store";
import { Switch } from "../ui/switch";
import { FC } from "react";

interface NodesSettingsProps {
  onChange?: () => void;
}

const NodesSettings: FC<NodesSettingsProps> = ({ onChange }) => {
  const { coloredNodes, setColoredNodes } = useSettingsStore(
    useShallow((state) => ({
      coloredNodes: state.colored_nodes,
      setColoredNodes: state.setColoredNodes,
    })),
  );

  return (
    <>
      <SettingsField
        label="Colored Nodes"
        description="Enable or disable colored nodes"
      >
        <Switch
          checked={coloredNodes}
          onCheckedChange={(checked) => {
            setColoredNodes(checked);
            onChange?.();
          }}
        />
      </SettingsField>
    </>
  );
};

export default NodesSettings;
