import {
  ChevronsLeftRightEllipsis,
  Columns3Cog,
  TableProperties,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LibraryItem from "../ui/library-item";
import SearchInput from "../ui/inputs/search-input";
import { useMemo, useState, type ChangeEvent } from "react";
import type { DragEventData } from "@neodrag/react";
import type { ObjectNodeData } from "@/components/nodes/object-node";

export type LibraryNodeTemplate = {
  type: "object";
  data: ObjectNodeData;
};

export type LibraryPaletteItem = {
  icon: LucideIcon;
  label: string;
  template: LibraryNodeTemplate;
};

type LibraryPanelProps = {
  onItemDropped?: (item: LibraryPaletteItem, drag: DragEventData) => void;
};

const items: LibraryPaletteItem[] = [
  {
    icon: TableProperties,
    label: "Class Node",
    template: {
      type: "object",
      data: {
        name: "Class",
        attributes: [],
        methods: [],
      },
    },
  },
  {
    icon: ChevronsLeftRightEllipsis,
    label: "Interface Node",
    template: {
      type: "object",
      data: {
        name: "Interface",
        stereotype: "interface",
        attributes: [],
        methods: [],
      },
    },
  },
  {
    icon: Tag,
    label: "Enum Node",
    template: {
      type: "object",
      data: {
        name: "Enum",
        stereotype: "enumeration",
        attributes: [],
        methods: [],
      },
    },
  },
  {
    icon: Columns3Cog,
    label: "Custom Node",
    template: {
      type: "object",
      data: {
        name: "Custom",
        attributes: [],
        methods: [],
      },
    },
  },
] as const;

const LibraryPanel = ({ onItemDropped }: LibraryPanelProps) => {
  const [query, setQuery] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <>
      <SearchInput
        placeholder="Search library..."
        className="w-full mb-4"
        value={query}
        onChange={handleSearch}
      />
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <LibraryItem
            key={`${item.label}-${resetKey}`}
            icon={item.icon}
            draggable
            onDragEnd={(drag) => {
              onItemDropped?.(item, drag);
              setResetKey((k) => k + 1);
            }}
          >
            {item.label}
          </LibraryItem>
        ))}
      </div>
    </>
  );
};

export default LibraryPanel;
