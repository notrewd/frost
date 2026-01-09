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
  const isInteractive = typeof onClick === "function";

  return (
    <Card
      className="group p-0 overflow-hidden flex flex-col items-stretch justify-end h-40 select-none gap-0 transition-all duration-200 border hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex flex-col items-center justify-center bg-muted/70 p-4 border-b relative flex-1">
        <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-linear-to-b from-transparent to-muted" />
        <Icon className="relative z-10 size-9 text-muted-foreground mx-auto transition-transform duration-200 group-hover:scale-105" />
      </div>
      <div className="flex flex-col items-center justify-center p-2 h-16">
        <span className="text-sm text-center leading-tight font-medium">
          {children}
        </span>
      </div>
    </Card>
  );
};

export default LibraryItem;
