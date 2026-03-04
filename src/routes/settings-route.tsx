import EditorSettings from "@/components/settings/editor";
import GeneralSettings from "@/components/settings/general";
import NodesSettings from "@/components/settings/nodes";
import EdgesSettings from "@/components/settings/edges";
import { Button } from "@/components/ui/button";
import ContentHeader from "@/components/ui/content-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { type } from "@tauri-apps/plugin-os";
import {
  Loader2,
  LucideIcon,
  Save,
  Settings2,
  TvMinimal,
  Workflow,
  Spline,
} from "lucide-react";
import { useCallback, useState } from "react";

interface Category {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  {
    id: "general",
    title: "General",
    description: "General application settings.",
    icon: Settings2,
  },
  {
    id: "editor",
    title: "Editor",
    description: "Customize the look and feel of the editor.",
    icon: TvMinimal,
  },
  {
    id: "nodes",
    title: "Nodes",
    description: "Manage visual appearance of nodes.",
    icon: Workflow,
  },
  {
    id: "edges",
    title: "Edges",
    description: "Manage visual appearance of edges.",
    icon: Spline,
  },
];

const SettingsRoute = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0],
  );

  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);

  const handleSave = useCallback(async () => {
    setBusy(true);
    try {
      await invoke("save_settings_state");
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <SidebarProvider>
      <Sidebar
        className={cn(type() === "windows" && "mt-8 h-auto!")}
        variant="floating"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <div className="flex flex-col gap-1">
              {categories.map((category) => (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category ? "bg-muted" : ""
                      }
                    >
                      <category.icon className="size-4" />
                      {category.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              ))}
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex flex-col items-stretch flex-1">
        <ContentHeader
          title={selectedCategory.title}
          description={selectedCategory.description}
          className="px-2"
        />
        <ScrollArea className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col p-2 gap-4">
            {selectedCategory.id === "general" && (
              <GeneralSettings onChange={() => setChanged(true)} />
            )}
            {selectedCategory.id === "edges" && (
              <EdgesSettings onChange={() => setChanged(true)} />
            )}
            {selectedCategory.id === "editor" && (
              <EditorSettings onChange={() => setChanged(true)} />
            )}
            {selectedCategory.id === "nodes" && (
              <NodesSettings onChange={() => setChanged(true)} />
            )}
          </div>
        </ScrollArea>
        <Separator className="my-2" />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={busy || !changed}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" /> Save
              </>
            )}
          </Button>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SettingsRoute;
