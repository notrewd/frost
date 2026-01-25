import { type } from "@tauri-apps/plugin-os";
import FrostIcon from "@/assets/graphics/frost.svg";
import { FC, useCallback, useEffect } from "react";
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
import { useProject } from "../providers/project-provider";
import { useEditorActions } from "../providers/editor-actions-provider";
import { listen } from "@tauri-apps/api/event";

const appWindow = getCurrentWindow();
const windowTitle = appWindow.title();

interface TitlebarProps {
  variant?: "default" | "no-title" | "dialog";
}

const Titlebar: FC<TitlebarProps> = ({ variant = "default" }) => {
  let projectData = "";
  const { cut, copy, paste, selectAll, state } = useEditorActions();

  if (variant === "default") {
    const { projectData: pdata } = useProject();
    projectData = pdata;
  }

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
    try {
      await invoke("save_file_as", { data: projectData });
    } catch (error) {
      console.error("Failed to save file as:", error);
    }
  }, [projectData]);

  useEffect(() => {
    const saveAsUnlisten = listen("save-as-requested", async () => {
      await handleSaveAs();
    });

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
      saveAsUnlisten.then((f) => f());
      cutUnlisten.then((f) => f());
      copyUnlisten.then((f) => f());
      pasteUnlisten.then((f) => f());
      selectAllUnlisten.then((f) => f());
    };
  }, [handleSaveAs, cut, copy, paste, selectAll]);

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
