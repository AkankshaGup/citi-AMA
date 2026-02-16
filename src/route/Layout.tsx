import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import "./Layout.css";

export default function AppLayout() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >

            <Header />
            <Box
                component="main"
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 3,
                    py: 2,
                    backgroundColor: "#f5f7fb",
                }}
            >
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
}
