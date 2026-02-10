import * as React from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
} from "@mui/material";

type LeaveType = "PTO" | "Sick" | "WFH" | "Unpaid";

export default function LeaveForecast() {
    const [leaveType, setLeaveType] = React.useState<LeaveType>("PTO");
    const [startDate, setStartDate] = React.useState<string>("");
    const [endDate, setEndDate] = React.useState<string>("");
    const [reason, setReason] = React.useState<string>("");

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: call your API here
        const payload = {
            leaveType,
            startDateUtc: startDate,
            endDateUtc: endDate,

            reason,
        };
        console.log("payload",payload);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                maxWidth: 760,
                mx: "auto",
                mt: 4,
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            {/* Form */}
            <Box component="form" onSubmit={handleSave} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Add Leave
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
                        gap: 2,
                        alignItems: "center",
                        maxWidth: 520,
                    }}
                >
                    {/* Leave type */}
                    <Typography>Leave type</Typography>
                    <TextField
                        select
                        size="small"
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                        fullWidth
                    >
                        <MenuItem value="PTO">PTO</MenuItem>
                        <MenuItem value="Sick">Sick</MenuItem>
                        <MenuItem value="WFH">WFH</MenuItem>
                        <MenuItem value="Unpaid">Unpaid</MenuItem>
                    </TextField>

                    {/* Dates */}
                    <Typography>Start - End</Typography>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "nowrap", width: "100%", }}>
                        <TextField
                            label="Start"
                            type="date"
                            size="small"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 180 }}
                            required
                        />
                        <TextField
                            label="End"
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 180 }}
                            required
                        />
                    </Box>

                    {/* Reason */}
                    <Typography>Reason</Typography>
                    <TextField
                        placeholder="Reason"
                        size="small"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />
                </Box>

                {/* Save */}
                <Box sx={{ mt: 4 }}>
                    <Button type="submit" variant="contained" sx={{ px: 4 }} onClick={handleSave}>
                        Save
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}