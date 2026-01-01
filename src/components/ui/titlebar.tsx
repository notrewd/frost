import { type } from "@tauri-apps/plugin-os";
import FrostIcon from "@/assets/frost.svg";
import { FC, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button.tsx";
import { Minus, Square, X } from "lucide-react";

const appWindow = getCurrentWindow();

interface TitlebarProps {
  includeTitle?: boolean;
}

const Titlebar: FC<TitlebarProps> = ({ includeTitle = true }) => {
  const handleMinimize = useCallback(() => {
    appWindow.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    appWindow.toggleMaximize();
  }, []);

  const handleClose = useCallback(() => {
    appWindow.close();
  }, []);

  if (type() !== "windows") {
    return null;
  }

  return (
    <div
      data-tauri-drag-region
      className="h-8 bg-secondary backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 select-none w-full"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        {includeTitle && (
          <>
            <img src={FrostIcon} alt="Application Icon" className="size-4" />
            <span className="text-sm font-medium">Frost 0.1.0</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="size-6 hover:bg-muted-foreground!"
          variant="ghost"
          onClick={handleMinimize}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          className="size-6 hover:bg-muted-foreground!"
          variant="ghost"
          onClick={handleMaximize}
        >
          <Square className="size-3" />
        </Button>
        <Button
          className="size-6 hover:bg-destructive!"
          variant="ghost"
          onClick={handleClose}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default Titlebar;
