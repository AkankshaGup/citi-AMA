import React from "react";
import { Grid, TextField, Paper, Typography, Box } from "@mui/material";
import UserDashboardHeader from "./timesheet/UserDashboardHeader";
import { addMonths, subMonths } from "date-fns";

const FIELDS = [
    {
        label: "What Went Well",
        placeholder: "Describe what worked well during this period",
    },
    {
        label: "What Could Have Gone Better",
        placeholder: "Mention areas for improvement",
    },
    {
        label: "Blockers / Challenges",
        placeholder: "List any blockers or challenges faced",
    },
    {
        label: "Things to Try",
        placeholder: "Ideas or experiments to try next",
    },
];

const KeyAchievements: React.FC = () => {
    const [month, setMonth] = React.useState<Date>(new Date());

    const handlePrev = () => setMonth((m) => subMonths(m, 1));
    const handleNext = () => setMonth((m) => addMonths(m, 1));
    const renderField = (
        label: string,
        placeholder: string,
        fullWidth = false
    ) => (
        <Grid size={{ xs: 12, md: fullWidth ? 12 : 6 }}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
                {label}
            </Typography>
            <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder={placeholder}
            />
        </Grid>
    );

    return (
        <Paper elevation={3} sx={{ maxWidth: 1200, mx: "auto", mt: 2, p: 2, position: "relative" }}>
            <Box>
                <UserDashboardHeader
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                    month={month}
                    title="Monthly Deliverables & Achievements"
                />
                <Grid container spacing={2}>
                    {FIELDS.map(({ label, placeholder }) =>
                        renderField(label, placeholder)
                    )}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" fontWeight={500} mb={0.5}>
                            Client Appreciation / Key Achievement
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder={`• Who gave the appreciation?\n• What was the appreciation?\n• Key achievement or impact`}
                            helperText="Include who appreciated, what was appreciated, and the key achievement"
                        />
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default KeyAchievements;