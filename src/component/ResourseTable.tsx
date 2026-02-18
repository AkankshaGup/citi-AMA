import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from "@mui/material";
import { api } from "../api/axiosInstance";
import StatusChip from "../generic/StatusChip";
import { getWeeksInCurrentMonth,getCurrentDateInfo } from "../utils/dateUtils";
import {resourceTimesheetData} from "../metadata/metadata";
interface IResourseTable {
    sowId: string
}

const ResourseTable: React.FC<IResourseTable> = ({ sowId }: IResourseTable) => {
    console.log(resourceTimesheetData)
    const {year, month} = getCurrentDateInfo();
    const [resourceData, setResourceData] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const totalWeeks = getWeeksInCurrentMonth();
    const fetchTeamResources = async () => {
        try {
            const res = await api.get(`/admin/reports/monthly?sowId=${sowId}&month=${year}-${month}&page=${page}&size=${rowsPerPage}`);
            // Expecting paginated response with `content` and pagination metadata
            const data = res.data;
            if (data && Array.isArray(data.content)) {
                setResourceData(data.content);
                setTotalCount(typeof data.totalElements === 'number' ? data.totalElements : data.content.length);
            } else if (Array.isArray(data)) {
                // fallback in case API returns plain array
                setResourceData(data);
                setTotalCount(data.length);
            } else {
                setResourceData([]);
                setTotalCount(0);
            }

        } catch (err) {
            // fallback metadata object
            const fallback = (resourceTimesheetData as any);
            setResourceData(Array.isArray(fallback.content) ? fallback.content : []);
            setTotalCount(typeof fallback.totalElements === 'number' ? fallback.totalElements : (Array.isArray(fallback.content) ? fallback.content.length : 0));
        }
    }
    useEffect(() => {
        fetchTeamResources();
    }, [sowId, page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRowClick = (row: any) => {
        setSelectedRow(row);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRow(null);
    };

    // Server provides paginated `content`, so render `resourceData` directly.
    const paginatedData = resourceData;
    const columns: { key: string; label: string; width?: number; render?: (v: any, i?: number, row?: any) => React.ReactNode }[] = [
        { key: "sno", label: "S.No", width: 3, render: (_v, i) => (i ?? 0) + 1 },
        { key: "location", label: "Location", width: 6 },
        { key: "employeeId", label: "Emp ID", width: 4 },
        { key: "soeId", label: "SOE ID", width: 4 },
        { key: "name", label: "Resource Name", width: 10 },
        { key: "assignmentStartDate", label: "Start Date", width: 6 },
        { key: "numberOfHalfDays", label: "Half Day", width: 4 },
        { key: "numberOfLeaves", label: "Leave", width: 3 },
        { key: "numberOfHolidays", label: "Holiday", width: 4 },
    ];
    for (let i = 1; i <= totalWeeks; i++) {
        columns.push({
            key: `week${i}`,
            label: `W${i}`,
            width: 2,
            render: (_v, _i, row) => {
                const weeklyHours = JSON.parse(row.weeklyHours || "[]");
                const weekData = weeklyHours[i - 1];
                if (!weekData) return "-";
                const num = Number(weekData.hours);
                return Number.isInteger(num) ? String(num) : String(num);
            }
        });
    }

    columns.push({ key: "totalHours", label: "TH", width: 2 },
        { key: "ptsSaved", label: "PTS Saved", width: 6, render: (value: boolean) => <StatusChip value={value} /> },
        { key: "cofyUpdate", label: "CoFY Updated", width: 6, render: (value: boolean) => <StatusChip value={value} /> },
        { key: "citiTraining", label: "Trainings", width: 6, render: (value: boolean) => <StatusChip value={value} /> });


    return (<>
        <TableContainer component={Paper}>
            <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                    <TableRow
                        sx={{
                            bgcolor: "#fafafa",
                        }}>
                        {columns.map((col) => (
                            <TableCell
                                key={col.key}
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "10px",
                                    color: "#000",
                                    whiteSpace: "nowrap",
                                    width: `${col.width ?? 0}%`,
                                    borderRight: "1px solid rgba(0,0,0,0.12)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    padding: "6px 8px",
                                }}
                                align="center"
                            >
                                {col.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {paginatedData.map((row, rowIndex) => (
                        <TableRow 
                            key={row.employeeId || rowIndex}
                            onClick={() => handleRowClick(row)}
                            sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                        >
                            {columns.map((col) => {
                                let value = (row as any)[col.key];
                                // special handling for serial number column
                                if (col.key === 'sno') {
                                    value = (page * rowsPerPage) + rowIndex + 1;
                                }

                                return (
                                    <TableCell key={col.key} align="center" sx={{
                                        fontSize: '10px',
                                        width: `${col.width ?? 0}%`,
                                        borderRight: "1px solid rgba(0,0,0,0.12)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        padding: "6px 8px",
                                    }}>
                                        {col.render
                                            ? col.render(value, rowIndex, row)
                                            : (value ?? "-")}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>

        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
            <DialogTitle>
                {selectedRow?.name} - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </DialogTitle>
            <DialogContent>
                {selectedRow && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                            {(() => {
                                try {
                                    const now = new Date();
                                    const year = now.getFullYear();
                                    const month = now.getMonth() + 1;

                                    const timesheets = JSON.parse(selectedRow.timesheets || "[]");
                                    const leaves = JSON.parse(selectedRow.leaves || "[]");
                                    const holidays = JSON.parse(selectedRow.holidays || "[]");

                                    // Create maps for quick lookup
                                    const timesheetMap = new Map();
                                    timesheets.forEach((sheet: any) => {
                                        const date = sheet.workDate.split("-")[2];
                                        timesheetMap.set(date, sheet.hoursLogged);
                                    });

                                    const leaveSet = new Set();
                                    leaves.forEach((leave: any) => {
                                        const date = leave.startDate.split("-")[2];
                                        leaveSet.add(date);
                                    });

                                    const holidaySet = new Set();
                                    holidays.forEach((holiday: any) => {
                                        const date = holiday.date.split("-")[2];
                                        holidaySet.add(date);
                                    });

                                    // Generate calendar dynamically for current month
                                    const daysInMonth = new Date(year, month, 0).getDate();
                                    const calendarDays = [];

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
                                                <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                                                    {day}
                                                </Typography>
                                                {hours && (
                                                    <Typography sx={{ fontSize: "12px", color: "#555" }}>
                                                        {hours} hrs
                                                    </Typography>
                                                )}
                                                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                                    {isLeave && (
                                                        <Chip
                                                            label="L"
                                                            size="small"
                                                            sx={{ backgroundColor: "#ffc107", color: "#000", fontWeight: 600, height: 20 }}
                                                        />
                                                    )}
                                                    {isHoliday && (
                                                        <Chip
                                                            label="H"
                                                            size="small"
                                                            sx={{ backgroundColor: "#f44336", color: "#fff", fontWeight: 600, height: 20 }}
                                                        />
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
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default ResourseTable;
