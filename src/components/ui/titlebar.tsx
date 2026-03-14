import { type } from "@tauri-apps/plugin-os";
import FrostIcon from "@/assets/graphics/app/frost.svg";
import { FC, useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button.tsx";
import {
  Minus,
  Square,
  X,
  FilePlus,
  FolderOpen,
  Save,
  SaveAll,
  Settings,
  Undo,
  Redo,
  Scissors,
  Copy,
  ClipboardPaste,
  BoxSelect,
  Download,
  ListTree,
} from "lucide-react";
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
import { useProjectStore } from "@/stores/project-store";
import DiscardDialog from "./dialogs/discard-dialog";
import { useShallow } from "zustand/react/shallow";

const appWindow = getCurrentWindow();

interface TitlebarProps {
  variant?: "default" | "no-title" | "dialog";
}

const Titlebar: FC<TitlebarProps> = ({ variant = "default" }) => {
  const [title, setTitle] = useState("Frost Editor");

  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [onConfirmDiscard, setOnConfirmDiscard] = useState<() => void>(
    () => {},
  );

  const { projectEdited, canUndo, canRedo } = useProjectStore(
    useShallow((state) => ({
      projectEdited: state.projectEdited,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
    })),
  );
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
  }, [projectEdited]);

  const handleSettings = useCallback(async () => {
    try {
      await invoke("open_settings_window");
    } catch (error) {
      console.error("Failed to open settings window:", error);
    }
  }, []);

  const showNewProjectWindow = useCallback(async () => {
    try {
      await invoke("open_new_project_window");
    } catch (error) {
      console.error("Failed to open new project window:", error);
    }
  }, []);

  const showExportWindow = useCallback(async () => {
    try {
      await invoke("open_export_window");
    } catch (error) {
      console.error("Failed to open export window:", error);
    }
  }, []);

  const showEdgesOutlinerWindow = useCallback(async () => {
    try {
      await invoke("open_edges_outliner_window");
    } catch (error) {
      console.error("Failed to open edges outliner window:", error);
    }
  }, []);

  const showOpenProjectDialog = useCallback(async () => {
    try {
      await invoke("open_project_file");
    } catch (error) {
      console.error("Failed to open project file:", error);
    }
  }, []);

  const handleNewProject = useCallback(async () => {
    if (projectEdited) {
      setOnConfirmDiscard(() => async () => {
        await showNewProjectWindow();
      });

      setDiscardDialogOpen(true);
      return;
    }

    await showNewProjectWindow();
  }, [projectEdited, showNewProjectWindow]);

  const handleOpenProject = useCallback(async () => {
    if (projectEdited) {
      setOnConfirmDiscard(() => async () => {
        await showOpenProjectDialog();
      });

      setDiscardDialogOpen(true);
      return;
    }

    await showOpenProjectDialog();
  }, [projectEdited, showOpenProjectDialog]);

  const handleSave = useCallback(async () => {
    emit("save-requested");
  }, []);

  const handleSaveAs = useCallback(async () => {
    emit("save-as-requested");
  }, []);

  const handleUndo = useCallback(() => {
    emit("undo");
  }, []);

  const handleRedo = useCallback(() => {
    emit("redo");
  }, []);

  useEffect(() => {
    if (type() !== "windows") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;

      if (!isModifier) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        !!target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");

      if (isEditableTarget) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ",":
          event.preventDefault();
          handleSettings();
          break;
        case "n":
          event.preventDefault();
          handleNewProject();
          break;
        case "o":
          event.preventDefault();
          handleOpenProject();
          break;
        case "s":
          event.preventDefault();
          if (event.shiftKey) {
            handleSaveAs();
          } else {
            handleSave();
          }
          break;
        case "e":
          event.preventDefault();
          showExportWindow();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNewProject, handleOpenProject, handleSave, handleSaveAs]);

  useEffect(() => {
    const newProjectUnlisten = listen("editor-new-project", async () => {
      handleNewProject();
    });

    const openProjectUnlisten = listen("editor-open-project", async () => {
      handleOpenProject();
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
      newProjectUnlisten.then((f) => f());
      openProjectUnlisten.then((f) => f());
      cutUnlisten.then((f) => f());
      copyUnlisten.then((f) => f());
      pasteUnlisten.then((f) => f());
      selectAllUnlisten.then((f) => f());
    };
  }, [cut, copy, paste, selectAll]);

  useEffect(() => {
    try {
      invoke("toggle_menu_item", {
        item: "cut_node",
        enabled: state.canCutCopy,
      });
      invoke("toggle_menu_item", {
        item: "copy_node",
        enabled: state.canCutCopy,
      });
      invoke("toggle_menu_item", {
        item: "paste_node",
        enabled: state.canPaste,
      });
    } catch (error) {
      console.error("Failed to toggle menu items:", error);
    }
  }, [state.canCutCopy, state.canPaste]);

  if (type() !== "windows") {
    return null;
  }

  return (
    <>
      <div
        data-tauri-drag-region
        className="h-8 shrink-0 bg-secondary backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 select-none w-full sticky top-0 z-10"
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
                      <FilePlus className="size-4" />
                      New Project
                      <MenubarShortcut>Ctrl+N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleOpenProject}>
                      <FolderOpen className="size-4" />
                      Open Project...
                      <MenubarShortcut>Ctrl+O</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleSave}>
                      <Save className="size-4" />
                      Save
                      <MenubarShortcut>Ctrl+S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onClick={handleSaveAs}>
                      <SaveAll className="size-4" />
                      Save As...
                      <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={showExportWindow}>
                      <Download className="size-4" />
                      Export...
                      <MenubarShortcut>Ctrl+E</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleSettings}>
                      <Settings className="size-4" />
                      Settings
                      <MenubarShortcut>Ctrl+,</MenubarShortcut>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Edit</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={handleUndo} disabled={!canUndo}>
                      <Undo className="size-4" />
                      Undo
                      <MenubarShortcut>Ctrl+Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onClick={handleRedo} disabled={!canRedo}>
                      <Redo className="size-4" />
                      Redo
                      <MenubarShortcut>Ctrl+Shift+Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={cut} disabled={!state.canCutCopy}>
                      <Scissors className="size-4" />
                      Cut
                      <MenubarShortcut>Ctrl+X</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onClick={copy} disabled={!state.canCutCopy}>
                      <Copy className="size-4" />
                      Copy
                      <MenubarShortcut>Ctrl+C</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onClick={paste} disabled={!state.canPaste}>
                      <ClipboardPaste className="size-4" />
                      Paste
                      <MenubarShortcut>Ctrl+V</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={selectAll}>
                      <BoxSelect className="size-4" />
                      Select All
                      <MenubarShortcut>Ctrl+A</MenubarShortcut>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>View</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={showEdgesOutlinerWindow}>
                      <ListTree className="size-4" />
                      Edges Outliner
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
      <DiscardDialog
        open={discardDialogOpen}
        onChange={setDiscardDialogOpen}
        onConfirm={onConfirmDiscard}
      />
    </>
  );
};

export default Titlebar;
