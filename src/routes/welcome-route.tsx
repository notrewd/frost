import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { CirclePlus, FolderOpen, FolderX } from "lucide-react";
import Titlebar from "@/components/ui/titlebar.tsx";
import FrostIcon from "@/assets/graphics/frost.svg";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

const WelcomeRoute = () => {
  const handleNewProject = useCallback(async () => {
    try {
      await invoke("open_new_project_window");
    } catch (error) {
      console.error("Failed to open new project window:", error);
    }
  }, []);

  return (
    <>
      <Titlebar variant="no-title" />
      <main className="flex items-stretch flex-1">
        <ResizablePanelGroup dir="horizontal">
          <ResizablePanel
            className="bg-secondary w-64 flex flex-col items-center justify-center gap-2"
            minSize={300}
            defaultSize={300}
          >
            <img
              src={FrostIcon}
              className="size-32 mb-4 pointer-events-none"
              alt="Application Icon"
            />
            <p className="text-xl font-medium">Frost</p>
            <p className="text-muted-foreground text-sm">version 0.1.0</p>
            <div className="flex flex-col gap-2 mt-10">
              <Button onClick={handleNewProject}>
                <CirclePlus />
                Create New Project
              </Button>
              <Button variant="outline">
                <FolderOpen />
                Open Existing Project
              </Button>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="flex flex-col" minSize={300}>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderX />
                </EmptyMedia>
                <EmptyTitle>No recent projects found</EmptyTitle>
                <EmptyDescription>
                  Get started by creating a new project.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  );
};

export default WelcomeRoute;
