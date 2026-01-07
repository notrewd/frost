import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router";
import WelcomeRoute from "./routes/welcome-route.tsx";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";
import NewProjectRoute from "@/routes/new-project-route.tsx";
import DialogLayout from "@/layouts/dialog-layout.tsx";
import MainLayout from "./layouts/main-layout.tsx";
import EditorRoute from "./routes/editor-route.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-dvh flex flex-col font-manrope">
        <BrowserRouter>
          <Routes>
            <Route index element={<WelcomeRoute />} />
            <Route element={<DialogLayout />}>
              <Route path="/new-project" element={<NewProjectRoute />} />
            </Route>
            <Route element={<MainLayout />}>
              <Route path="/editor" element={<EditorRoute />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
