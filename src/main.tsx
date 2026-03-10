import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router";
import WelcomeRoute from "./routes/welcome-route.tsx";
import { EditorActionsProvider } from "@/components/providers/editor-actions-provider";
import NewProjectRoute from "@/routes/new-project-route.tsx";
import DialogLayout from "@/layouts/dialog-layout.tsx";
import MainLayout from "./layouts/main-layout.tsx";
import EditorRoute from "./routes/editor-route.tsx";
import { initProjectListeners } from "@/stores/project-store";
import SettingsRoute from "./routes/settings-route.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import ExportRoute from "./routes/export-route.tsx";

initProjectListeners();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider>
      <EditorActionsProvider>
        <div className="h-dvh flex flex-col font-manrope">
          <BrowserRouter>
            <Routes>
              <Route index element={<WelcomeRoute />} />
              <Route element={<DialogLayout />}>
                <Route path="/new-project" element={<NewProjectRoute />} />
                <Route path="/settings" element={<SettingsRoute />} />
                <Route path="/export" element={<ExportRoute />} />
              </Route>
              <Route element={<MainLayout />}>
                <Route path="/editor" element={<EditorRoute />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </EditorActionsProvider>
    </TooltipProvider>
  </React.StrictMode>,
);
