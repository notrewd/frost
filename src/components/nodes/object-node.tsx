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
          <span className="text-green-400">
            {attr.accessModifier === "public"
              ? "+"
              : attr.accessModifier === "private"
                ? "-"
                : "#"}{" "}
          </span>
          {attr.name}
          <span className="text-red-400">:</span>{" "}
          <span className="text-blue-400">{attr.type}</span>
        </p>
      ))}
      {data.attributes && data.attributes.length > 0 && (
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
        </p>
      ))}
    </Card>
  );
};

export default ObjectNode;
