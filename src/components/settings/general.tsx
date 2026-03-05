import { useSettingsStore } from "@/stores/settings-store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useShallow } from "zustand/react/shallow";
import SettingsField from "../ui/settings-field";
import { FC } from "react";

interface GeneralSettingsProps {
  onChange?: () => void;
  searchQuery?: string;
}

const GeneralSettings: FC<GeneralSettingsProps> = ({
  onChange,
  searchQuery = "",
}) => {
  const { theme, setTheme } = useSettingsStore(
    useShallow((state) => ({
      theme: state.theme,
      setTheme: state.setTheme,
    })),
  );

  const isMatch = (text: string) =>
    text.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <>
      {(isMatch("Theme") ||
        isMatch("Select the theme for the application")) && (
        <SettingsField
          label="Theme"
          description="Select the theme for the application"
        >
          <Select
            value={theme}
            onValueChange={(value) => {
              setTheme(value as "light" | "dark" | "system");
              onChange?.();
            }}
          >
            <SelectTrigger className="w-48!">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </SettingsField>
      )}
    </>
  );
};

export default GeneralSettings;
