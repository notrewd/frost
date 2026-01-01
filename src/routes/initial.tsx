import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { FolderX } from "lucide-react";

const InitialRoute = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderX />
        </EmptyMedia>
        <EmptyTitle>No projects found</EmptyTitle>
        <EmptyDescription>
          Get started by creating a new project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>New Project</Button>
          <Button variant="outline">Open Project</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
};

export default InitialRoute;
