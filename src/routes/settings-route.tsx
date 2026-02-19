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
import { Settings2 } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  title: string;
  description: string;
}

const categories: Category[] = [
  {
    id: "general",
    title: "General",
    description: "General application settings.",
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Customize the look and feel of the application.",
  },
  {
    id: "shortcuts",
    title: "Shortcuts",
    description: "Manage keyboard shortcuts for various actions.",
  },
];

const SettingsRoute = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0],
  );

  return (
    <SidebarProvider>
      <Sidebar variant="floating">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSelectedCategory(categories[0])}
                  className={
                    selectedCategory === categories[0] ? "bg-muted" : ""
                  }
                >
                  <Settings2 className="size-4" />
                  General
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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
          <div className="flex flex-1 flex-col p-2">
            {selectedCategory.id === "general" && <GeneralSettings />}
          </div>
        </ScrollArea>
      </main>
    </SidebarProvider>
  );
};

export default SettingsRoute;
