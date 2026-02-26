import { FC } from "react";
import { TabsContent } from "../../tabs";
import {
  ObjectNodeData,
  ObjectNodeMethod,
  ObjectNodeProperty,
} from "@/components/nodes/object-node";
import { Button } from "../../button";
import { Plus } from "lucide-react";
import { ScrollArea } from "../../scroll-area";
import ObjectNodeMethodItem from "../../items/object-node-method-item";

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
          <Plus className="size-4" /> Add
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
              <ObjectNodeMethodItem
                key={index}
                method={method}
                index={index}
                onUpdateMethod={updateMethod}
                onRemoveMethod={removeMethod}
                onAddParameter={addParameter}
                onUpdateParameter={updateParameter}
                onRemoveParameter={removeParameter}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </TabsContent>
  );
};

export default MethodsTab;
