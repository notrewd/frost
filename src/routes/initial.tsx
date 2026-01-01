import { NavLink } from "react-router";
import { Button } from "@/components/ui/button.tsx";

const InitialRoute = () => {
  return (
    <main className="flex flex-col h-dvh w-full items-center justify-center gap-4">
      <p>Frost Initial Page</p>
      <NavLink to="/second">
        <Button>Go to Second Page</Button>
      </NavLink>
    </main>
  );
};

export default InitialRoute;
