import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import InitialRoute from "./routes/initial-route.tsx";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="h-dvh flex flex-col">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<InitialRoute />} />
          </Routes>
        </BrowserRouter>
      </main>
    </ThemeProvider>
  </React.StrictMode>,
);
