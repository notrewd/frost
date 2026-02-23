import { FC, ReactNode } from "react";
import { Field, FieldContent, FieldDescription, FieldLabel } from "./field";

interface SettingsFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
}

const SettingsField: FC<SettingsFieldProps> = ({
  label,
  description,
  children,
}) => {
  return (
    <Field className="flex-row gap-4">
      <FieldContent className="flex-1 gap-0">
        <FieldLabel>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      {children}
    </Field>
  );
};

export default SettingsField;
