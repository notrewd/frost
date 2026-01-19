import { ProjectProvider } from "@/components/providers/project-provider";
import Titlebar from "@/components/ui/titlebar.tsx";
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <ProjectProvider>
      <Titlebar />
      <main className="flex flex-col flex-1">
        <Outlet />
      </main>
    </ProjectProvider>
  );
};

export default MainLayout;
