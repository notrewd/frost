import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type ProjectContextValue = {
  projectName: string;
  projectPath: string;
};

type ProjectDetailsResult = [string | null, string | null];

const ProjectContext = createContext<ProjectContextValue | null>(null);

const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectName, setProjectName] = useState("");
  const [projectPath, setProjectPath] = useState("");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const [name, path] = await invoke<ProjectDetailsResult>(
          "request_project_details",
        );

        setProjectName(name ?? "");
        setProjectPath(path ?? "");
      } catch (error) {
        console.error("Failed to fetch project details:", error);
      }
    };

    fetchProjectDetails();
  }, []);

  return (
    <ProjectContext.Provider value={{ projectName, projectPath }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }

  return context;
};

export { ProjectContext, ProjectProvider };
