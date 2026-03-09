import React from "react";
import {
    Box,
    Typography,
    IconButton,
    Divider
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
    format,
} from "date-fns";

interface IUserDashboardHeaderProps {
    handleNext: () => void;
    handlePrev: () => void;
    isNextDisabled?: boolean;
    isPreDisabled?: boolean;
    month: Date;
    title?: string;
}
const UserDashboardHeader: React.FC<IUserDashboardHeaderProps> = ({ isNextDisabled, title, month, isPreDisabled, handlePrev, handleNext }: IUserDashboardHeaderProps) => {
    return (<>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>
                {title}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, gap: 2 }}>
                {/* Prev disabled in prev month */}
                <IconButton onClick={handlePrev} disabled={isPreDisabled}>
                    <ChevronLeftIcon />
                </IconButton>

                <Typography fontWeight={700} sx={{ textAlign: "center", fontSize: "18px", minWidth: 160 }}>
                    {format(month, "MMMM yyyy")}
                </Typography>

                {/* Next should stay enabled (unless loading) */}
                <IconButton onClick={handleNext} disabled={isNextDisabled}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
    </>
    )
}

export default UserDashboardHeader;