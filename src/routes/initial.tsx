import {NavLink} from "react-router";

const InitialRoute = () => {
    return (
        <main className="bg-zinc-800 flex flex-col h-dvh w-full items-center justify-center text-white">
            <p>Frost Initial Page</p>
            <NavLink to="/second">Go to Second Page</NavLink>
        </main>
    );
};

export default InitialRoute;