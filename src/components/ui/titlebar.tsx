import { type } from "@tauri-apps/plugin-os";
import FrostIcon from "@/assets/frost.svg";
import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button.tsx";
import { Minus, Square, X } from "lucide-react";

const appWindow = getCurrentWindow();

const Titlebar = () => {
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
      className="absolute top-0 left-0 right-0 h-8 bg-muted backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 select-none"
    >
      <div className="flex items-center gap-2">
        <img src={FrostIcon} alt="Application Icon" className="size-4" />
        <span className="text-sm">Frost 0.1.0</span>
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
