import { type Node } from "@xyflow/react";
import { type ObjectNodeData } from "@/components/nodes/object-node";

export const initialNodes: Node<ObjectNodeData>[] = [
  {
    id: "n1",
    type: "object",
    position: { x: 0, y: 0 },
    data: {
      name: "Person",
      attributes: [
        { name: "firstName", type: "string", accessModifier: "private" },
        { name: "lastName", type: "string", accessModifier: "private" },
        {
          name: "age",
          type: "number",
          accessModifier: "private",
          defaultValue: "0",
        },
      ],
      methods: [
        {
          name: "setFullName",
          accessModifier: "public",
          returnType: "void",
          parameters: [
            { name: "firstName", type: "string" },
            { name: "lastName", type: "string" },
          ],
        },
        {
          name: "getFullName",
          accessModifier: "public",
          returnType: "string",
          parameters: [],
        },
        {
          name: "setAge",
          accessModifier: "public",
          returnType: "void",
          parameters: [{ name: "age", type: "number" }],
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
        { name: "employeeId", type: "string", accessModifier: "private" },
      ],
      methods: [
        {
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
          name: "Active",
          accessModifier: "public",
          defaultValue: "1",
          static: true,
        },
        {
          name: "Inactive",
          accessModifier: "public",
          defaultValue: "0",
          static: true,
        },
        {
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
