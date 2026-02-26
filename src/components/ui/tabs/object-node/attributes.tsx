import { FC, useMemo, useState } from "react";
import { TabsContent } from "../../tabs";
import {
  ObjectNodeData,
  ObjectNodeAttribute,
} from "@/components/nodes/object-node";
import { Button } from "../../button";
import { Input } from "../../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";
import { Switch } from "../../switch";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "../../scroll-area";
import SearchInput from "../../inputs/search-input";

interface AttributesTabProps {
  data: ObjectNodeData;
  setData: (data: ObjectNodeData) => void;
}

const AttributesTab: FC<AttributesTabProps> = ({ data, setData }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const attributes = useMemo(() => {
    if (!data.attributes) return [];
    return data.attributes.filter((attr) =>
      attr.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data.attributes, searchQuery]);

  const addAttribute = () => {
    const newAttribute: ObjectNodeAttribute = {
      name: "newAttribute",
      accessModifier: "private",
      type: "string",
    };
    setData({ ...data, attributes: [...attributes, newAttribute] });
  };

  const updateAttribute = (
    index: number,
    updated: Partial<ObjectNodeAttribute>,
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], ...updated };
    setData({ ...data, attributes: newAttributes });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setData({ ...data, attributes: newAttributes });
  };

  return (
    <TabsContent value="attributes" className="flex flex-col gap-3 h-75">
      <div className="flex flex-col sticky -top-px bg-background z-10 py-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Attributes</span>
          <Button variant="outline" size="sm" onClick={addAttribute}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <SearchInput
          placeholder="Search attributes..."
          className="mt-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1 border rounded-md p-2">
        {attributes.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            No attributes{" "}
            {searchQuery ? `matching "${searchQuery}"` : "defined"}.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {attributes.map((attr, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-2 border rounded-md bg-muted/20"
              >
                <div className="flex gap-2 items-center">
                  <Select
                    value={attr.accessModifier}
                    onValueChange={(val: any) =>
                      updateAttribute(index, { accessModifier: val })
                    }
                  >
                    <SelectTrigger className="h-8!">
                      <SelectValue placeholder="Access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (+)</SelectItem>
                      <SelectItem value="private">Private (-)</SelectItem>
                      <SelectItem value="protected">Protected (#)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-8 font-mono flex-1"
                    value={attr.name}
                    onChange={(e) =>
                      updateAttribute(index, { name: e.target.value })
                    }
                    placeholder="Name"
                  />
                  <span className="text-muted-foreground">:</span>
                  <Input
                    className="h-8 font-mono w-32"
                    value={attr.type || ""}
                    onChange={(e) =>
                      updateAttribute(index, { type: e.target.value })
                    }
                    placeholder="Type"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeAttribute(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="flex gap-4 items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Static
                    </span>
                    <Switch
                      checked={attr.static || false}
                      onCheckedChange={(checked) =>
                        updateAttribute(index, { static: checked })
                      }
                    />
                  </div>
                  <Input
                    className="h-7 text-xs font-mono flex-1"
                    value={attr.defaultValue || ""}
                    onChange={(e) =>
                      updateAttribute(index, { defaultValue: e.target.value })
                    }
                    placeholder="Default Value"
                  />
                  <Input
                    className="h-7 text-xs font-mono flex-1"
                    value={attr.stereotype || ""}
                    onChange={(e) =>
                      updateAttribute(index, { stereotype: e.target.value })
                    }
                    placeholder="Stereotype"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </TabsContent>
  );
};

export default AttributesTab;
