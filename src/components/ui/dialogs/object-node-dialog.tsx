import { FC, useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
} from "../responsive-dialog";
import { DialogDescription, DialogTitle } from "../dialog";
import { ObjectNodeData } from "@/components/nodes/object-node";
import { Tabs, TabsList, TabsTrigger } from "../tabs";
import GeneralTab from "../tabs/object-node/general";

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
  const [internalData, setInternalData] = useState<ObjectNodeData>(data);

  return (
    <Tabs defaultValue="general">
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        className="gap-2"
      >
        <ResponsiveDialogHeader>
          <DialogTitle>{data.name}</DialogTitle>
          <DialogDescription>
            Customize the properties and methods of the object node.
          </DialogDescription>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
          </TabsList>
        </ResponsiveDialogHeader>
        <ResponsiveDialogContent>
          <div className="flex flex-col pb-2">
            <GeneralTab data={internalData} setData={setInternalData} />
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </Tabs>
  );
};

export default ObjectNodeDialog;
