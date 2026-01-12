import { FC } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

export interface ObjectNodeProperty {
  name: string;
  type: string;
}

export interface ObjectNodeAttribute extends ObjectNodeProperty {
  accessModifier: "public" | "private" | "protected";
  defaultValue?: string;
}

export interface ObjectNodeMethod {
  name: string;
  accessModifier: string;
  returnType: string;
  parameters: ObjectNodeProperty[];
}

export interface ObjectNodeData {
  name: string;
  attributes?: ObjectNodeAttribute[];
  methods?: ObjectNodeMethod[];
}

interface ObjectNodeProps {
  data: ObjectNodeData;
}

const ObjectNode: FC<ObjectNodeProps> = ({ data }) => {
  return (
    <Card className="gap-2 py-4 font-mono">
      <p className="px-4 w-full text-center">{data.name}</p>
      <Separator className="my-2" />
      {data.attributes?.map((attr, index) => (
        <p key={index} className="px-4">
          {attr.accessModifier === "public"
            ? "+"
            : attr.accessModifier === "private"
              ? "-"
              : "#"}{" "}
          {attr.name}: {attr.type}
        </p>
      ))}
      {data.attributes && data.attributes.length > 0 && (
        <Separator className="my-2" />
      )}
      {data.methods?.map((method, index) => (
        <p key={index} className="px-4">
          {method.accessModifier === "public"
            ? "+"
            : method.accessModifier === "private"
              ? "-"
              : "#"}{" "}
          {method.name}(
          {method.parameters
            .map((param) => `${param.name}: ${param.type}`)
            .join(", ")}
          ): {method.returnType}
        </p>
      ))}
    </Card>
  );
};

export default ObjectNode;
