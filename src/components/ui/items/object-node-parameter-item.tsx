import { FC } from "react";
import { Input } from "../input";
import { ObjectNodeProperty } from "@/components/nodes/object-node";
import { Button } from "../button";
import { Trash2 } from "lucide-react";

interface ObjectNodeParameterItemProps {
  param: ObjectNodeProperty;
  index: number;
  pIndex: number;
  onUpdateParameter: (
    methodIndex: number,
    paramIndex: number,
    updated: Partial<ObjectNodeProperty>,
  ) => void;
  onRemoveParameter: (methodIndex: number, paramIndex: number) => void;
}

const ObjectNodeParameterItem: FC<ObjectNodeParameterItemProps> = ({
  param,
  index,
  pIndex,
  onUpdateParameter,
  onRemoveParameter,
}) => {
  return (
    <div className="flex flex-col gap-2 p-2 border rounded-md bg-muted/20">
      <div key={pIndex} className="flex gap-2 items-center">
        <Input
          className="h-7 text-xs font-mono flex-1"
          value={param.name}
          onChange={(e) =>
            onUpdateParameter(index, pIndex, {
              name: e.target.value,
            })
          }
          placeholder="Name"
        />
        <span className="text-muted-foreground text-xs">:</span>
        <Input
          className="h-7 text-xs font-mono w-25"
          value={param.type || ""}
          onChange={(e) =>
            onUpdateParameter(index, pIndex, {
              type: e.target.value,
            })
          }
          placeholder="Type"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={() => onRemoveParameter(index, pIndex)}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
      <Input
        className="h-7 text-xs font-mono"
        value={param.defaultValue || ""}
        onChange={(e) =>
          onUpdateParameter(index, pIndex, {
            defaultValue: e.target.value,
          })
        }
        placeholder="Default Value"
      />
    </div>
  );
};

export default ObjectNodeParameterItem;
