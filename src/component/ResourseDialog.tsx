import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip } from "@mui/material";
import { alpha } from '@mui/material/styles';
import { TimesheetLegend } from "./timesheet/TimesheetLegend";

interface Props {
    open: boolean;
    onClose: () => void;
    selectedRow: any | null;
    year: string;
    month: string;
}

export default function ResourseDialog({ open, onClose, selectedRow, year, month }: Props) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ paddingBottom: '8px' }}>
                {selectedRow?.name} - {new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "long", year: "numeric" })}
            </DialogTitle>
            <DialogContent sx={{ paddingBottom: '8px' }}>
                {selectedRow ? (
                    <Box sx={{ mt: 2 }}>
                        <>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                                    <Box key={d} sx={{ textAlign: 'center' }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>{d}</Typography>
                                    </Box>
                                ))}
                            </Box>

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

                                        // Generate calendar for provided month/year and align to Monday-first columns
                                        const daysInMonth = new Date(y, m, 0).getDate();
                                        const firstWeekday = new Date(y, m - 1, 1).getDay(); // 0=Sun..6=Sat
                                        const offset = firstWeekday === 0 ? 6 : firstWeekday - 1; // Monday-first offset

                                        const calendarCells: React.ReactNode[] = [];

                                        // Add empty placeholders for days before the 1st
                                        for (let i = 0; i < offset; i++) {
                                            calendarCells.push(
                                                <Box key={`empty-${i}`} sx={{ minHeight: 40 }} />
                                            );
                                        }

                                        for (let day = 1; day <= daysInMonth; day++) {
                                            const dayStr = String(day).padStart(2, "0");
                                            const hours = timesheetMap.get(dayStr);
                                            const hoursNum = typeof hours === 'number' ? hours : Number(hours || 0);
                                            const isHalf = hoursNum === 4;
                                            const isLeave = leaveSet.has(dayStr);
                                            const isHoliday = holidaySet.has(dayStr);
                                            const weekday = new Date(y, m - 1, day).toLocaleString("default", { weekday: "short" });

                                            calendarCells.push(
                                                <Box
                                                    key={day}
                                                    sx={{
                                                        border: "1px solid #ddd",
                                                        borderRadius: "4px",
                                                        padding: "8px",
                                                        minHeight: "40px",
                                                        backgroundColor: (theme: any) =>
                                                            isHalf
                                                                ? '#f0b17e'
                                                                : isHoliday
                                                                    ? alpha(theme.palette.info.light, 0.22)
                                                                    : isLeave
                                                                        ? alpha(theme.palette.warning.light, 0.22)
                                                                        : theme.palette.background.default,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 600, fontSize: "12px" }}>{day}</Typography>
                                                    </Box>
                                                    {hours && (
                                                        <Typography sx={{ fontSize: "12px", color: "#555" }}>{hours} hrs</Typography>
                                                    )}
                                                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                                                        {isLeave && (
                                                            <Chip label="L" size="small" sx={{ backgroundColor: "warning.light", color: "#000", fontWeight: 600, height: 20 }} />
                                                        )}
                                                        {isHoliday && (
                                                            <Chip label="H" size="small" sx={{ backgroundColor: "info.light", color: "#fff", fontWeight: 600, height: 20 }} />
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        }

                                        // Optionally pad trailing cells to keep grid consistent
                                        const totalCells = offset + daysInMonth;
                                        const trailing = (7 - (totalCells % 7)) % 7;
                                        for (let i = 0; i < trailing; i++) {
                                            calendarCells.push(<Box key={`trail-${i}`} sx={{ minHeight: 40 }} />);
                                        }

                                        return calendarCells;
                                    } catch (e) {
                                        return <Typography>Error loading calendar data</Typography>;
                                    }
                                })()}
                            </Box>
                        </>
                        <Box marginTop={3}>
                            <TimesheetLegend />
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
