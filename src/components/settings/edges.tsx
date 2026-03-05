import SettingsField from "../ui/settings-field";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/stores/settings-store";
import { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EdgesSettingsProps {
  onChange?: () => void;
  searchQuery?: string;
}

const EdgesSettings: FC<EdgesSettingsProps> = ({
  onChange,
  searchQuery = "",
}) => {
  const { edgeStyle, setEdgeStyle } = useSettingsStore(
    useShallow((state) => ({
      edgeStyle: state.edge_style,
      setEdgeStyle: state.setEdgeStyle,
    })),
  );

  const isMatch = (text: string) =>
    text.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <>
      {(isMatch("Edge Style") ||
        isMatch("Choose the visual style of the edges connecting nodes") ||
        isMatch("Straight") ||
        isMatch("Smooth Step") ||
        isMatch("Bezier")) && (
        <SettingsField
          label="Edge Style"
          description="Choose the visual style of the edges connecting nodes"
        >
          <Select
            value={edgeStyle}
            onValueChange={(val) => {
              setEdgeStyle(val as any);
              onChange?.();
            }}
          >
            <SelectTrigger className="w-48!">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight">Straight</SelectItem>
              <SelectItem value="smoothstep">Smooth Step</SelectItem>
              <SelectItem value="bezier">Bezier</SelectItem>
            </SelectContent>
          </Select>
        </SettingsField>
      )}
    </>
  );
};

export default EdgesSettings;
