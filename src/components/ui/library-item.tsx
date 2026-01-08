import { LucideIcon } from "lucide-react";
import { FC, ReactNode } from "react";
import { Card } from "./card";

interface LibraryItemProps {
  icon: LucideIcon;
  children: ReactNode;
  onClick?: () => void;
}

const LibraryItem: FC<LibraryItemProps> = ({
  icon: Icon,
  children,
  onClick,
}) => {
  return (
    <Card
      className="p-4 hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-2 cursor-pointer"
      onClick={onClick}
    >
      <Icon className="size-8 text-muted-foreground" />
      <span className="text-sm text-center">{children}</span>
    </Card>
  );
};

export default LibraryItem;
