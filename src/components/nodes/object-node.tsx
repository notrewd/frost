import { FC, useState } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ObjectNodeDialog from "../ui/dialogs/object-node-dialog";

export interface ObjectNodeProperty {
  name: string;
  type?: string;
  static?: boolean;
}

export interface ObjectNodeAttribute extends ObjectNodeProperty {
  accessModifier: "public" | "private" | "protected";
  stereotype?: string;
  defaultValue?: string;
}

export interface ObjectNodeMethod {
  name: string;
  accessModifier: string;
  abstract?: boolean;
  static?: boolean;
  returnType: string;
  parameters: ObjectNodeProperty[];
}

export interface ObjectNodeData extends Record<string, unknown> {
  name: string;
  stereotype?: string;
  attributes?: ObjectNodeAttribute[];
  methods?: ObjectNodeMethod[];
}

interface ObjectNodeProps {
  data: ObjectNodeData;
  selected: boolean;
}

const ObjectNode: FC<ObjectNodeProps> = ({ data, selected }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card
        className={cn("gap-2 py-4 font-mono", selected && "ring")}
        onDoubleClick={() => setDialogOpen(true)}
      >
        {data.stereotype && (
          <div className="px-4 w-full flex items-center justify-center text-muted-foreground">
            <ChevronsLeft className="size-4" />
            <span>{data.stereotype}</span>
            <ChevronsRight className="size-4" />
          </div>
        )}
        <p className="px-4 w-full text-center">{data.name}</p>
        <Separator className="my-2" />
        {data.attributes?.map((attr, index) => (
          <p key={index} className="px-4">
            <span className="text-green-400">
              {attr.accessModifier === "public"
                ? "+"
                : attr.accessModifier === "private"
                  ? "-"
                  : "#"}{" "}
            </span>
            <span
              className={cn({
                underline: attr.static,
              })}
            >
              {attr.name}
              {attr.type && (
                <>
                  <span className="text-red-400">:</span>{" "}
                  <span className="text-blue-400">{attr.type}</span>
                </>
              )}
            </span>
          </p>
        ))}
        {data.methods && data.methods.length > 0 && (
          <Separator className="my-2" />
        )}
        {data.methods?.map((method, index) => (
          <p key={index} className="px-4">
            <span className="text-green-400">
              {method.accessModifier === "public"
                ? "+"
                : method.accessModifier === "private"
                  ? "-"
                  : "#"}{" "}
            </span>
            <span
              className={cn({
                underline: method.static,
                italic: method.abstract,
              })}
            >
              {method.name}(
              {method.parameters.map((param, index) => (
                <>
                  <span className="text-orange-400">{param.name}</span>
                  <span className="text-red-400">:</span>{" "}
                  <span className="text-blue-400">{param.type}</span>
                  {index < method.parameters.length - 1 ? ", " : ""}
                </>
              ))}
              )<span className="text-red-400">:</span>{" "}
              <span className="text-blue-400">{method.returnType}</span>
            </span>
          </p>
        ))}
        {!data.attributes?.length && !data.methods?.length && (
          <p className="px-4 italic text-muted-foreground">
            No attributes or methods
          </p>
        )}
      </Card>
      <ObjectNodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={data}
      />
    </>
  );
};

export default ObjectNode;
