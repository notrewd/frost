import { FC, useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
} from "../responsive-dialog";
import { DialogDescription, DialogTitle } from "../dialog";
import { ObjectNodeData } from "@/components/nodes/object-node";
import { Field, FieldContent, FieldLabel } from "../field";
import { Input } from "../input";

interface ObjectNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ObjectNodeData;
}

const ObjectNodeDialog: FC<ObjectNodeDialogProps> = ({
  open,
  onOpenChange,
  data,
}) => {
  const [name, setName] = useState(data.name);
  const [stereotype, setStereotype] = useState(data.stereotype);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogHeader>
        <DialogTitle>{data.name}</DialogTitle>
        <DialogDescription>
          Customize the properties and methods of the object node.
        </DialogDescription>
      </ResponsiveDialogHeader>
      <ResponsiveDialogContent>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldContent className="flex flex-col gap-0">
              <FieldLabel className="m-0">Name</FieldLabel>
            </FieldContent>
            <Input
              className="font-mono"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldContent className="flex flex-col gap-0">
              <FieldLabel className="m-0">Stereotype</FieldLabel>
            </FieldContent>
            <Input
              className="font-mono"
              value={stereotype}
              onChange={(e) => setStereotype(e.target.value)}
              placeholder="None"
            />
          </Field>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default ObjectNodeDialog;
