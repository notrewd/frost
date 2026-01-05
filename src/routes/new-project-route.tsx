import { useForm } from "@tanstack/react-form";
import {
  projectNameSchema,
  projectPathSchema,
} from "@/schemas/project-schemas.ts";
import { z } from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

const formSchema = z.object({
  projectName: projectNameSchema,
  projectPath: projectPathSchema,
});

const NewProjectRoute = () => {
  const form = useForm({
    defaultValues: {
      projectName: "",
      projectPath: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted with values:", value);
      // Handle form submission logic here
    },
  });

  return (
    <div className="flex flex-col flex-1">
      <form
        id="new-project-form"
        className="flex flex-col flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="projectName"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalud={isInvalid}>
                  <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="My Awesome Project"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
          <form.Field
            name="projectPath"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalud={isInvalid}>
                  <FieldLabel htmlFor="projectPath">Project Path</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="/path/to/project"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>
      </form>
      <div className="flex justify-end mt-4">
        <Button type="submit" form="new-project-form">
          Create Project
        </Button>
      </div>
    </div>
  );
};

export default NewProjectRoute;
