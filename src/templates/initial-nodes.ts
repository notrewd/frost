import { type Node } from "@xyflow/react";
import { type ObjectNodeData } from "@/components/nodes/object-node";
import {
  generateUniqueAttributeId,
  generateUniqueMethodId,
  generateUniqueParameterId,
} from "@/lib/utils";

export const initialNodes: Node<ObjectNodeData>[] = [
  {
    id: "n1",
    type: "object",
    position: { x: 0, y: 0 },
    data: {
      name: "Person",
      attributes: [
        {
          id: generateUniqueAttributeId(),
          name: "firstName",
          type: "string",
          accessModifier: "private",
        },
        {
          id: generateUniqueAttributeId(),
          name: "lastName",
          type: "string",
          accessModifier: "private",
        },
        {
          id: generateUniqueAttributeId(),
          name: "age",
          type: "number",
          accessModifier: "private",
          defaultValue: "0",
        },
      ],
      methods: [
        {
          id: generateUniqueMethodId(),
          name: "setFullName",
          accessModifier: "public",
          returnType: "void",
          parameters: [
            {
              id: generateUniqueParameterId(),
              name: "firstName",
              type: "string",
            },
            {
              id: generateUniqueParameterId(),
              name: "lastName",
              type: "string",
            },
          ],
        },
        {
          id: generateUniqueMethodId(),
          name: "getFullName",
          accessModifier: "public",
          returnType: "string",
          parameters: [],
        },
        {
          id: generateUniqueMethodId(),
          name: "setAge",
          accessModifier: "public",
          returnType: "void",
          parameters: [
            { id: generateUniqueParameterId(), name: "age", type: "number" },
          ],
        },
      ],
    },
  },
  {
    id: "n2",
    type: "object",
    position: { x: 0, y: 100 },
    data: {
      name: "Employee",
      attributes: [
        {
          id: generateUniqueAttributeId(),
          name: "employeeId",
          type: "string",
          accessModifier: "private",
        },
      ],
      methods: [
        {
          id: generateUniqueMethodId(),
          name: "getEmployeeDetails",
          accessModifier: "public",
          returnType: "string",
          parameters: [],
        },
      ],
    },
  },
  {
    id: "n3",
    type: "object",
    position: { x: 300, y: 200 },
    data: {
      name: "Status",
      stereotype: "enumeration",
      attributes: [
        {
          id: generateUniqueAttributeId(),
          name: "Active",
          accessModifier: "public",
          defaultValue: "1",
          static: true,
        },
        {
          id: generateUniqueAttributeId(),
          name: "Inactive",
          accessModifier: "public",
          defaultValue: "0",
          static: true,
        },
        {
          id: generateUniqueAttributeId(),
          name: "Pending",
          accessModifier: "public",
          defaultValue: "2",
          static: true,
        },
      ],
      methods: [],
    },
  },
];
