import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter, Routes, Route} from "react-router";
import InitialRoute from "./routes/initial.tsx";
import SecondRoute from "./routes/second.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<InitialRoute/>}/>
                <Route path="/second" element={<SecondRoute/>}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
);
