import { Outlet } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";

export default function AppLayout() {
    return (
        <>

            <Header />
            <main className="content">
                <Outlet />
            </main>
        </>
    );
}
