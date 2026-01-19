import { type } from "@tauri-apps/plugin-os";
import FrostIcon from "@/assets/graphics/frost.svg";
import { FC, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button.tsx";
import { Minus, Square, X } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "./menubar";
import { Separator } from "./separator";
import { invoke } from "@tauri-apps/api/core";

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

  const handleSaveAs = useCallback(async () => {
    await invoke("save_file_as");
  }, []);

  if (type() !== "windows") {
    return null;
  }

  return (
    <div
      data-tauri-drag-region
      className="h-8 bg-secondary backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 select-none w-full"
    >
      <div className="flex items-center gap-2">
        {(variant === "default" || variant === "dialog") && (
          <div className="flex items-center gap-2 pointer-events-none">
            <img src={FrostIcon} alt="Application Icon" className="size-4" />
            <span className="text-sm font-medium text-nowrap">
              {windowTitle}
            </span>
          </div>
        )}

        {variant === "default" && (
          <>
            <Separator orientation="vertical" className="min-h-4 ml-2" />
            <Menubar className="px-0">
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    New Project <MenubarShortcut>Ctrl+N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    Open Project... <MenubarShortcut>Ctrl+O</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    Save <MenubarShortcut>Ctrl+S</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={handleSaveAs}>
                    Save As... <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    Redo <MenubarShortcut>Ctrl+Y</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
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
