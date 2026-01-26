import { type } from "@tauri-apps/plugin-os";
import FrostIcon from "@/assets/graphics/frost.svg";
import { FC, useCallback, useEffect, useState } from "react";
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
import { useEditorActions } from "../providers/editor-actions-provider";
import { emit, listen } from "@tauri-apps/api/event";
import { ProjectOpenedEvent } from "@/types/events";
import { useProject } from "../providers/project-provider";

const appWindow = getCurrentWindow();

interface TitlebarProps {
  variant?: "default" | "no-title" | "dialog";
}

const Titlebar: FC<TitlebarProps> = ({ variant = "default" }) => {
  const [title, setTitle] = useState("Frost Editor");

  const { projectEdited } = useProject();
  const { cut, copy, paste, selectAll, state } = useEditorActions();

  useEffect(() => {
    const fetchWindowTitle = async () => {
      const currentTitle = await appWindow.title();
      setTitle(currentTitle);
    };

    fetchWindowTitle();

    const unlisten = listen<ProjectOpenedEvent>("project-opened", (event) => {
      setTitle(`${event.payload.name} – Frost Editor`);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleMinimize = useCallback(async () => {
    await appWindow.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    await appWindow.toggleMaximize();
  }, []);

  const handleClose = useCallback(async () => {
    await appWindow.close();
  }, []);

  const handleNewProject = useCallback(async () => {
    try {
      await invoke("open_new_project_window");
    } catch (error) {
      console.error("Failed to open new project window:", error);
    }
  }, []);

  const handleOpenProject = useCallback(async () => {
    try {
      await invoke("open_project_file");
    } catch (error) {
      console.error("Failed to open project file:", error);
    }
  }, []);

  const handleSaveAs = useCallback(async () => {
    emit("save-as-requested");
  }, []);

  useEffect(() => {
    const cutUnlisten = listen("editor-cut", async () => {
      cut();
      console.log("cut event received");
    });

    const copyUnlisten = listen("editor-copy", async () => {
      copy();
    });

    const pasteUnlisten = listen("editor-paste", async () => {
      paste();
    });

    const selectAllUnlisten = listen("editor-select_all", async () => {
      selectAll();
    });

    return () => {
      cutUnlisten.then((f) => f());
      copyUnlisten.then((f) => f());
      pasteUnlisten.then((f) => f());
      selectAllUnlisten.then((f) => f());
    };
  }, [cut, copy, paste, selectAll]);

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
            <span className="text-sm font-medium text-nowrap">{title}</span>
            {projectEdited && (
              <span className="text-sm text-nowrap text-muted-foreground">
                Unsaved
              </span>
            )}
          </div>
        )}

        {variant === "default" && (
          <>
            <Separator orientation="vertical" className="min-h-4 ml-2" />
            <Menubar className="px-0">
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={handleNewProject}>
                    New Project <MenubarShortcut>Ctrl+N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={handleOpenProject}>
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
                  <MenubarItem onClick={cut} disabled={!state.canCutCopy}>
                    Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={copy} disabled={!state.canCutCopy}>
                    Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={paste} disabled={!state.canPaste}>
                    Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={selectAll}>
                    Select All <MenubarShortcut>Ctrl+A</MenubarShortcut>
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
