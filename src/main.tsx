import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import InitialRoute from "./routes/initial-route.tsx";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";
import Titlebar from "@/components/ui/titlebar.tsx";
import { cn } from "@/lib/utils.ts";
import { type } from "@tauri-apps/plugin-os";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main
        className={cn("h-dvh flex flex-col", {
          "pt-8": type() === "windows",
        })}
      >
        <Titlebar />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<InitialRoute />} />
          </Routes>
        </BrowserRouter>
      </main>
    </ThemeProvider>
  </React.StrictMode>,
);
