import { FC } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

export interface DiagramNodeProperty {
  name: string;
  type: string;
}

export interface DiagramNodeAttribute extends DiagramNodeProperty {
  accessModifier: "public" | "private" | "protected";
  defaultValue?: string;
}

export interface DiagramNodeMethod {
  name: string;
  accessModifier: string;
  returnType: string;
  parameters: DiagramNodeProperty[];
}

export interface DiagramNodeData {
  name: string;
  attributes?: DiagramNodeAttribute[];
  methods?: DiagramNodeMethod[];
}

interface DiagramNodeProps {
  data: DiagramNodeData;
}

const DiagramNode: FC<DiagramNodeProps> = ({ data }) => {
  return (
    <Card className="gap-2 py-4">
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

export default DiagramNode;
