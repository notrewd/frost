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
import FrostIcon from "@/assets/frost.svg";

const InitialRoute = () => {
  return (
    <>
      <Titlebar includeTitle={false} />
      <main className="flex items-stretch flex-1">
        <div className="bg-secondary w-64 flex flex-col items-center justify-center gap-2">
          <img
            src={FrostIcon}
            className="size-32 mb-4 pointer-events-none"
            alt="Application Icon"
          />
          <p className="text-xl font-medium">Frost</p>
          <p className="text-muted-foreground text-sm">version 0.1.0</p>
          <div className="flex flex-col gap-2 mt-10">
            <Button>
              <CirclePlus />
              Create New Project
            </Button>
            <Button variant="outline">
              <FolderOpen />
              Open Existing Project
            </Button>
          </div>
        </div>
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
      </main>
    </>
  );
};

export default InitialRoute;
