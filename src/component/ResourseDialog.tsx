import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip } from "@mui/material";

interface Props {
    open: boolean;
    onClose: () => void;
    selectedRow: any | null;
    year: string; // yyyy
    month: string; // MM
}

export default function ResourseDialog({ open, onClose, selectedRow, year, month }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{paddingBottom:'8px'}}>
                {selectedRow?.name} - {new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "long", year: "numeric" })}
            </DialogTitle>
            <DialogContent sx={{ paddingBottom: '8px' }}>
                {selectedRow ? (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                            {(() => {
                                try {
                                    const y = Number(year);
                                    const m = Number(month);

                                    const timesheets = JSON.parse(selectedRow.timesheets || "[]");
                                    const leaves = JSON.parse(selectedRow.leaves || "[]");
                                    const holidays = JSON.parse(selectedRow.holidays || "[]");

                                    // Create maps for quick lookup
                                    const timesheetMap = new Map<string, number>();
                                    timesheets.forEach((sheet: any) => {
                                        const parts = (sheet.workDate || "").split("-");
                                        const date = parts[2];
                                        if (date) timesheetMap.set(date, sheet.hoursLogged);
                                    });

                                    const leaveSet = new Set<string>();
                                    leaves.forEach((leave: any) => {
                                        const parts = (leave.startDate || "").split("-");
                                        const date = parts[2];
                                        if (date) leaveSet.add(date);
                                    });

                                    const holidaySet = new Set<string>();
                                    holidays.forEach((holiday: any) => {
                                        const parts = (holiday.date || "").split("-");
                                        const date = parts[2];
                                        if (date) holidaySet.add(date);
                                    });

                                    // Generate calendar for provided month/year
                                    const daysInMonth = new Date(y, m, 0).getDate();
                                    const calendarDays: React.ReactNode[] = [];

                                    for (let day = 1; day <= daysInMonth; day++) {
                                        const dayStr = String(day).padStart(2, "0");
                                        const hours = timesheetMap.get(dayStr);
                                        const isLeave = leaveSet.has(dayStr);
                                        const isHoliday = holidaySet.has(dayStr);

                                        calendarDays.push(
                                            <Box
                                                key={day}
                                                sx={{
                                                    border: "1px solid #ddd",
                                                    borderRadius: "4px",
                                                    padding: "8px",
                                                    minHeight: "40px",
                                                    backgroundColor: isHoliday ? "#ffe0e0" : isLeave ? "#fff3cd" : "#f9f9f9",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>{day}</Typography>
                                                {hours && (
                                                    <Typography sx={{ fontSize: "12px", color: "#555" }}>{hours} hrs</Typography>
                                                )}
                                                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                                    {isLeave && (
                                                        <Chip label="L" size="small" sx={{ backgroundColor: "#ffc107", color: "#000", fontWeight: 600, height: 20 }} />
                                                    )}
                                                    {isHoliday && (
                                                        <Chip label="H" size="small" sx={{ backgroundColor: "#f44336", color: "#fff", fontWeight: 600, height: 20 }} />
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    }

                                    return calendarDays;
                                } catch (e) {
                                    return <Typography>Error loading calendar data</Typography>;
                                }
                            })()}
                        </Box>
                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip label="H" sx={{ width: 70, height: 32, fontSize: 13, backgroundColor: '#ffe0e0', color: '#000', fontWeight: 600 }} />
                                <Typography>Holiday</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip label="L" sx={{ width: 70, height: 32, fontSize: 13, backgroundColor: '#fff3cd', color: '#000', fontWeight: 600 }} />
                                <Typography>Leave</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip label="4 hrs" sx={{ width: 70, height: 32, fontSize: 13, backgroundColor: '#f9f9f9', color: '#000', fontWeight: 600, border: '1px solid rgba(0,0,0,0.12)' }} />
                                <Typography>Half Day</Typography>
                            </Box>
                        </Box>
                    </Box>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
