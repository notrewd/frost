import {NavLink} from "react-router";

const SecondRoute = () => {
    return (
        <main className="bg-zinc-800 flex flex-col h-dvh w-full items-center justify-center text-white">
            <p>Frost Second Page</p>
            <NavLink to="/">Go to Initial Page</NavLink>
        </main>
    );
};

export default SecondRoute;