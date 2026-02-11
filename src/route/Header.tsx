import React from "react";
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    IconButton,
    Button,
    Avatar,
} from "@mui/material";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { auth } from "../auth/auth";
import {  useNavigate } from "react-router-dom";
import altilogo from "../assets/altilogo.png";
import { getInitials } from "../utils/userUtils.ts";

const Header: React.FC = () => {
    const user = auth.getUser();
    const navigate = useNavigate();
      const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                background: "linear-gradient(90deg, #0B4DBA 0%, #0A3FA3 100%)",
                px: 2,
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* LEFT SECTION */}
                <Box display="flex" alignItems="center" gap={2}>
                    {/* Logo */}
                    <Box
                        component="img"
                        src={altilogo} // replace with actual logo path
                        alt="DEX Logo"
                        sx={{ height: 32 }}
                    />

                    {/* Brand Name */}
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ letterSpacing: 1 }}
                    >
                        Welcome, {user?.name}
                    </Typography>
                </Box>

                <PopupState variant="popover" popupId="demo-popup-menu">
                    {(popupState) => (
                        <React.Fragment>
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: "#fff",
                                    color: "#0B4DBA",
                                    fontWeight: 700,
                                    fontSize: "14px",
                                    ml: 1,
                                }}
                                {...bindTrigger(popupState)}
                            >
                                {getInitials(user?.name || "")}
                            </Avatar>
                            <Menu {...bindMenu(popupState)}>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </React.Fragment>
                    )}

                </PopupState>

            </Toolbar>
        </AppBar>
    );
};

export default Header;
