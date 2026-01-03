import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router";
import InitialRoute from "./routes/initial-route.tsx";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";
import NewProjectRoute from "@/routes/new-project-route.tsx";
import DialogLayout from "@/layouts/dialog-layout.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-dvh flex flex-col">
        <BrowserRouter>
          <Routes>
            <Route index element={<InitialRoute />} />
            <Route element={<DialogLayout />}>
              <Route path="/new-project" element={<NewProjectRoute />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  </React.StrictMode>,
);
