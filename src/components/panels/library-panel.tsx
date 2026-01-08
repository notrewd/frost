import { ChevronsLeftRightEllipsis, TableProperties } from "lucide-react";
import LibraryItem from "../ui/library-item";
import SearchInput from "../ui/inputs/search-input";
import { useState } from "react";

const items = [
  { icon: TableProperties, label: "Class Node" },
  { icon: ChevronsLeftRightEllipsis, label: "Interface Node" },
];

const LibraryPanel = () => {
  const [filteredItems, setFilteredItems] = useState(items);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setFilteredItems(
      items.filter((item) => item.label.toLowerCase().includes(query))
    );
  };

  return (
    <>
      <SearchInput
        placeholder="Search library..."
        className="w-full mb-4"
        onChange={handleSearch}
      />
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <LibraryItem key={item.label} icon={item.icon}>
            {item.label}
          </LibraryItem>
        ))}
      </div>
    </>
  );
};

export default LibraryPanel;
