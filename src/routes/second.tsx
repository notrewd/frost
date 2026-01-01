import { NavLink } from "react-router";
import { Button } from "@/components/ui/button.tsx";

const SecondRoute = () => {
  return (
    <main className="flex flex-col h-dvh w-full items-center justify-center gap-4">
      <p>Frost Second Page</p>
      <NavLink to="/">
        <Button>Go to Initial Page</Button>
      </NavLink>
    </main>
  );
};

export default SecondRoute;
