import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import InitialRoute from "./routes/initial-route.tsx";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-dvh flex flex-col">
        <BrowserRouter>
          <Routes>
            <Route index element={<InitialRoute />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  </React.StrictMode>,
);
