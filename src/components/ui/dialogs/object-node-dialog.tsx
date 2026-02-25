import { FC, useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
} from "../responsive-dialog";
import { DialogDescription, DialogTitle } from "../dialog";
import { ObjectNodeData } from "@/components/nodes/object-node";
import { Field, FieldContent, FieldLabel } from "../field";
import { Textarea } from "../textarea";
import { Input } from "../input";
import { Switch } from "../switch";

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
  const [name, setName] = useState<string>(data.name);
  const [stereotype, setStereotype] = useState<string>(data.stereotype || "");
  const [abstract, setAbstract] = useState<boolean>(data.abstract || false);
  const [note, setNote] = useState<string>(data.note || "");

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
          <Field className="gap-1">
            <FieldContent className="flex flex-col gap-0">
              <FieldLabel>Name</FieldLabel>
            </FieldContent>
            <Input
              className="font-mono"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="small"
            />
          </Field>
          <Field className="gap-1">
            <FieldContent className="flex flex-col gap-0">
              <FieldLabel>Stereotype</FieldLabel>
            </FieldContent>
            <Input
              className="font-mono"
              value={stereotype}
              onChange={(e) => setStereotype(e.target.value)}
              placeholder="None"
              variant="small"
            />
          </Field>
          <Field orientation="horizontal">
            <FieldContent className="flex flex-col gap-0 flex-1">
              <FieldLabel>Abstract</FieldLabel>
            </FieldContent>
            <Switch
              checked={abstract}
              onCheckedChange={(checked) => setAbstract(checked)}
            />
          </Field>
          <Field className="mb-2 gap-1">
            <FieldContent className="flex flex-col gap-0">
              <FieldLabel>Note</FieldLabel>
            </FieldContent>
            <Textarea
              className="font-mono min-h-25"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="None"
              variant="small"
            />
          </Field>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default ObjectNodeDialog;
