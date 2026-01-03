import Titlebar from "@/components/ui/titlebar.tsx";
import { Outlet } from "react-router";

const DialogLayout = () => {
  return (
    <>
      <Titlebar variant="dialog" />
      <main className="flex flex-col flex-1 px-6 py-4">
        <Outlet />
      </main>
    </>
  );
};

export default DialogLayout;
