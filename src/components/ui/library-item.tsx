import { LucideIcon } from "lucide-react";
import { FC, ReactNode, useMemo, useRef, useState } from "react";
import { useDraggable, type DragEventData } from "@neodrag/react";
import { createPortal } from "react-dom";
import { Card } from "./card";

interface LibraryItemProps {
  icon: LucideIcon;
  children: ReactNode;
  onClick?: () => void;
  draggable?: boolean;
  onDragEnd?: (data: DragEventData) => void;
}

const LibraryItem: FC<LibraryItemProps> = ({
  icon: Icon,
  children,
  onClick,
  draggable = false,
  onDragEnd,
}) => {
  const isInteractive = typeof onClick === "function";
  const draggableRef = useRef<HTMLDivElement>(null!);
  const [preview, setPreview] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const updatePreviewPosition = (data: DragEventData) => {
    setPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        x: data.event.clientX - prev.width / 2,
        y: data.event.clientY - prev.height / 2,
      };
    });
  };

  const handleDragStart = (data: DragEventData) => {
    const rect = data.rootNode.getBoundingClientRect();
    setPreview({
      width: rect.width,
      height: rect.height,
      x: data.event.clientX - rect.width / 2,
      y: data.event.clientY - rect.height / 2,
    });
  };

  const handleDragEnd = (data: DragEventData) => {
    setPreview(null);
    onDragEnd?.(data);
  };

  const { isDragging } = useDraggable(draggableRef, {
    handle: ".library-item-drag-handle",
    onDragStart: handleDragStart,
    onDrag: updatePreviewPosition,
    onDragEnd: handleDragEnd,
  });

  const card = useMemo(
    () => (
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
          <span className="text-sm text-center leading-tight font-medium text-foreground/95">
            {children}
          </span>
        </div>
      </Card>
    ),
    [Icon, children, isInteractive, onClick]
  );

  if (!draggable) return card;

  return (
    <>
      <div
        ref={draggableRef}
        className={isDragging ? "cursor-grabbing opacity-0" : "cursor-grab"}
      >
        <div className="library-item-drag-handle">{card}</div>
      </div>
      {preview
        ? createPortal(
            <div
              className="pointer-events-none fixed z-9999"
              style={{
                left: 0,
                top: 0,
                width: preview.width,
                height: preview.height,
                transform: `translate3d(${preview.x}px, ${preview.y}px, 0)`,
              }}
            >
              {card}
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export default LibraryItem;
