import {
  Archive,
  ChevronsLeftRightEllipsis,
  TableProperties,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LibraryItem from "../ui/library-item";
import SearchInput from "../ui/inputs/search-input";
import { useMemo, useState, type ChangeEvent } from "react";
import type { DragEventData } from "@neodrag/react";
import type { ObjectNodeData } from "@/components/nodes/object-node";
import PropertiesSection from "../ui/properties-section";
import { Separator } from "../ui/separator";

export type LibraryNodeTemplate = {
  type: "object" | "package";
  data: ObjectNodeData;
};

export type LibraryPaletteItem = {
  icon: LucideIcon;
  label: string;
  template: LibraryNodeTemplate;
};

export type LibraryPalleteCategory = {
  label: string;
  items: LibraryPaletteItem[];
};

type LibraryPanelProps = {
  onItemDropped?: (item: LibraryPaletteItem, drag: DragEventData) => void;
};

const categories: LibraryPalleteCategory[] = [
  {
    label: "General",
    items: [
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
        icon: Archive,
        label: "Package",
        template: {
          type: "package",
          data: {
            name: "Package",
          },
        },
      },
    ],
  },
  {
    label: "Templates",
    items: [
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
    ],
  },
] as const;

const LibraryPanel = ({ onItemDropped }: LibraryPanelProps) => {
  const [query, setQuery] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return categories;

    const filtered = categories.map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.label.toLowerCase().includes(q),
      ),
    }));

    // we don't want to show empty categories, so we filter them out
    return filtered.filter((category) => category.items.length > 0);
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
      {filteredCategories.map((item, index) => (
        <>
          <Separator className="my-2" />
          <PropertiesSection title={item.label} key={index}>
            <div className="grid grid-cols-2 gap-4">
              {item.items.map((paletteItem) => (
                <LibraryItem
                  key={`${paletteItem.label}-${resetKey}`}
                  icon={paletteItem.icon}
                  draggable
                  onDragEnd={(drag) => {
                    onItemDropped?.(paletteItem, drag);
                    setResetKey((k) => k + 1);
                  }}
                >
                  {paletteItem.label}
                </LibraryItem>
              ))}
            </div>
          </PropertiesSection>
        </>
      ))}
    </>
  );
};

export default LibraryPanel;
