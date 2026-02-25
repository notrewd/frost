import { FC } from "react";
import { TabsContent } from "../../tabs";
import {
  ObjectNodeData,
  ObjectNodeMethod,
  ObjectNodeProperty,
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

interface MethodsTabProps {
  data: ObjectNodeData;
  setData: (data: ObjectNodeData) => void;
}

const MethodsTab: FC<MethodsTabProps> = ({ data, setData }) => {
  const methods = data.methods || [];

  const addMethod = () => {
    const newMethod: ObjectNodeMethod = {
      name: "newMethod",
      accessModifier: "public",
      returnType: "void",
      parameters: [],
    };
    setData({ ...data, methods: [...methods, newMethod] });
  };

  const updateMethod = (index: number, updated: Partial<ObjectNodeMethod>) => {
    const newMethods = [...methods];
    newMethods[index] = { ...newMethods[index], ...updated };
    setData({ ...data, methods: newMethods });
  };

  const removeMethod = (index: number) => {
    const newMethods = [...methods];
    newMethods.splice(index, 1);
    setData({ ...data, methods: newMethods });
  };

  const addParameter = (methodIndex: number) => {
    const method = methods[methodIndex];
    const newParam: ObjectNodeProperty = { name: "param", type: "string" };
    updateMethod(methodIndex, {
      parameters: [...(method.parameters || []), newParam],
    });
  };

  const updateParameter = (
    methodIndex: number,
    paramIndex: number,
    updated: Partial<ObjectNodeProperty>,
  ) => {
    const method = methods[methodIndex];
    const newParams = [...(method.parameters || [])];
    newParams[paramIndex] = { ...newParams[paramIndex], ...updated };
    updateMethod(methodIndex, { parameters: newParams });
  };

  const removeParameter = (methodIndex: number, paramIndex: number) => {
    const method = methods[methodIndex];
    const newParams = [...(method.parameters || [])];
    newParams.splice(paramIndex, 1);
    updateMethod(methodIndex, { parameters: newParams });
  };

  return (
    <TabsContent value="methods" className="flex flex-col gap-3 h-75">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Methods</span>
        <Button variant="outline" size="sm" onClick={addMethod}>
          <Plus className="size-4 mr-1" /> Add
        </Button>
      </div>
      <ScrollArea className="flex-1 border rounded-md p-2">
        {methods.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            No methods defined.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {methods.map((method, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-2 border rounded-md bg-muted/20"
              >
                <div className="flex gap-2 items-center">
                  <Select
                    value={method.accessModifier}
                    onValueChange={(val: any) =>
                      updateMethod(index, { accessModifier: val })
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
                    value={method.name}
                    onChange={(e) =>
                      updateMethod(index, { name: e.target.value })
                    }
                    placeholder="Name"
                  />
                  <span className="text-muted-foreground">:</span>
                  <Input
                    className="h-8 font-mono w-25"
                    value={method.returnType || ""}
                    onChange={(e) =>
                      updateMethod(index, { returnType: e.target.value })
                    }
                    placeholder="Return Type"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeMethod(index)}
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
                      checked={method.static || false}
                      onCheckedChange={(checked) =>
                        updateMethod(index, { static: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Abstract
                    </span>
                    <Switch
                      checked={method.abstract || false}
                      onCheckedChange={(checked) =>
                        updateMethod(index, { abstract: checked })
                      }
                    />
                  </div>
                </div>

                {/* Parameters */}
                <div className="mt-2 pl-4 border-l-2 border-muted">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Parameters
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => addParameter(index)}
                    >
                      <Plus className="size-3 mr-1" /> Add Param
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {method.parameters?.map((param, pIndex) => (
                      <div key={pIndex} className="flex gap-2 items-center">
                        <Input
                          className="h-7 text-xs font-mono flex-1"
                          value={param.name}
                          onChange={(e) =>
                            updateParameter(index, pIndex, {
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
                            updateParameter(index, pIndex, {
                              type: e.target.value,
                            })
                          }
                          placeholder="Type"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeParameter(index, pIndex)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </TabsContent>
  );
};

export default MethodsTab;
