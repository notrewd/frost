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
  projectData: string;
  setProjectData: (data: string) => void;
};

type ProjectDetailsResult = [string | null, string | null, string | null];

const ProjectContext = createContext<ProjectContextValue | null>(null);

const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

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

        setMounted(true);
      } catch (error) {
        console.error("Failed to fetch project details:", error);
      }
    };

    fetchProjectDetails();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const setProjectData = async () => {
      try {
        await invoke("set_project_data", { data: projectData });
        console.log("Project data saved successfully.");
      } catch (error) {
        console.error("Failed to save project data:", error);
      }
    };

    setProjectData();
  }, [projectData, mounted]);

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
