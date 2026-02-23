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

const GeneralSettings = () => {
  const { theme, setTheme } = useSettingsStore(
    useShallow((state) => ({
      theme: state.theme,
      setTheme: state.setTheme,
    })),
  );

  return (
    <>
      <SettingsField
        label="Theme"
        description="Select the theme for the application"
      >
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-50!">
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
    </>
  );
};

export default GeneralSettings;
