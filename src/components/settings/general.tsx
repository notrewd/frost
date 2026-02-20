import { useSettingsStore } from "@/stores/settings-store";
import { Field, FieldContent, FieldDescription, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useShallow } from "zustand/react/shallow";

const GeneralSettings = () => {
  const { theme, setTheme } = useSettingsStore(
    useShallow((state) => ({
      theme: state.theme,
      setTheme: state.setTheme,
    })),
  );

  return (
    <>
      <Field className="flex-row gap-4">
        <FieldContent className="flex-1 gap-0">
          <FieldLabel>Theme</FieldLabel>
          <FieldDescription>Select the application theme.</FieldDescription>
        </FieldContent>
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
      </Field>
    </>
  );
};

export default GeneralSettings;
