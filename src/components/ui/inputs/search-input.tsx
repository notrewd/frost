import { ChangeEvent, ComponentProps, FC } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchInputProps extends ComponentProps<typeof Input> {
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  className,
  ...props
}) => {
  return (
    <div className={cn("relative w-full", className)}>
      <Input
        type="search"
        variant="small"
        value={value}
        onChange={onChange}
        className="pl-9"
        {...props}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
    </div>
  );
};

export default SearchInput;
