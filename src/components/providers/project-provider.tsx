import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
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
  projectData: string;
  setProjectData: (data: string) => void;
};

type ProjectDetailsResult = [string | null, string | null, string | null];

type ProjectOpenedEvent = {
  name: string;
  path: string;
  data: string;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectName, setProjectName] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const [projectData, setProjectData] = useState("");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const [name, path, data] = await invoke<ProjectDetailsResult>(
          "request_project_details",
        );

        setProjectName(name ?? "");
        setProjectPath(path ?? "");
        setProjectData(data ?? "");
      } catch (error) {
        console.error("Failed to fetch project details:", error);
      }
    };

    fetchProjectDetails();

    const unlisten = listen<ProjectOpenedEvent>(
      "project-opened",
      async (event) => {
        const { name, path, data } = event.payload;

        setProjectName(name);
        setProjectPath(path);
        setProjectData(data);
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <ProjectContext.Provider
      value={{ projectName, projectPath, projectData, setProjectData }}
    >
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
