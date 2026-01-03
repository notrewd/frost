import { type } from "@tauri-apps/plugin-os";
import FrostIcon from "@/assets/frost.svg";
import { FC, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button.tsx";
import { Minus, Square, X } from "lucide-react";

const appWindow = getCurrentWindow();
const windowTitle = appWindow.title();

interface TitlebarProps {
  variant?: "default" | "no-title" | "dialog";
}

const Titlebar: FC<TitlebarProps> = ({ variant = "default" }) => {
  const handleMinimize = useCallback(async () => {
    await appWindow.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    await appWindow.toggleMaximize();
  }, []);

  const handleClose = useCallback(async () => {
    await appWindow.close();
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
        {(variant === "default" || variant === "dialog") && (
          <>
            <img src={FrostIcon} alt="Application Icon" className="size-4" />
            <span className="text-sm font-medium text-nowrap">
              {windowTitle}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {variant !== "dialog" && (
          <>
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
          </>
        )}
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
