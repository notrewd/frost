import EditorSettings from "@/components/settings/editor";
import GeneralSettings from "@/components/settings/general";
import ContentHeader from "@/components/ui/content-header";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { type } from "@tauri-apps/plugin-os";
import { LucideIcon, Settings2, TvMinimal } from "lucide-react";
import { useState } from "react";

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
];

const SettingsRoute = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0],
  );

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
            {selectedCategory.id === "general" && <GeneralSettings />}
            {selectedCategory.id === "editor" && <EditorSettings />}
          </div>
        </ScrollArea>
      </main>
    </SidebarProvider>
  );
};

export default SettingsRoute;
