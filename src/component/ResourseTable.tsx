import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Backdrop,
    CircularProgress,
    Alert,
    Box,
    Chip,
    Typography,
} from "@mui/material";

import { addMonths, subMonths, startOfMonth, format } from "date-fns";
import { api } from "../api/axiosInstance";
import StatusChip from "../generic/StatusChip";
import { getWeeksInCurrentMonth } from "../utils/dateUtils";
import { resourceTimesheetData } from "../metadata/metadata";
import { TimesheetHeader } from "./timesheet/TimesheetHeader.tsx";
import ResourseDialog from "./ResourseDialog.tsx";
interface IResourseTable {
    sowId: string
}

const ResourseTable: React.FC<IResourseTable> = ({ sowId }: IResourseTable) => {
    console.log(resourceTimesheetData)

    const currentMonthStart = React.useMemo(() => startOfMonth(new Date()), []);
    const [month, setMonth] = React.useState<Date>(currentMonthStart);
    const [resourceData, setResourceData] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const totalWeeks = getWeeksInCurrentMonth();
    const fetchTeamResources = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const yearStr = format(month, "yyyy");
            const monthStr = format(month, "MM");
            const res = await api.get(`/public/reports/monthly?sowId=${sowId}&month=${yearStr}-${monthStr}&page=${page}&size=${rowsPerPage}`);
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
            // fallback metadata object and surface an error message
            const fallback = (resourceTimesheetData as any);
            setResourceData(Array.isArray(fallback.content) ? fallback.content : []);
            setTotalCount(typeof fallback.totalElements === 'number' ? fallback.totalElements : (Array.isArray(fallback.content) ? fallback.content.length : 0));
            setErrorMsg(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchTeamResources();
    }, [sowId, page, rowsPerPage, month]);


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
        { key: "location", label: "Location", width: 4 },
        { key: "employeeId", label: "Emp ID", width: 4 },
        { key: "soeId", label: "SOE ID", width: 4 },
        { key: "name", label: "Resource Name", width: 6 },
        { key: "assignmentStartDate", label: "Start Date", width: 4},
        { key: "numberOfHalfDays", label: "Half Day", width: 4 },
        { key: "numberOfLeaves", label: "Leave", width: 3 },
        { key: "numberOfHolidays", label: "Holiday", width: 4 },
        { key: "totalHours", label: "Capacity", width: 4 }
    ];
    for (let i = 1; i <= totalWeeks; i++) {
        columns.push({
            key: `week${i}`,
            label: `PTS W${i}`,
            width: 4,
            render: (_v, _i, row) => {
                const weeklyHours = JSON.parse(row.weeklyHours || "[]");
                const weekData = weeklyHours[i - 1];
                if (!weekData) return "-";
                const num = Number(weekData.hours);
                return Number.isInteger(num) ? String(num) : String(num);
            }
        });
    }

    columns.push(
        {
            key: "totalPtsHours",
            label: "Total PTS hrs",
            width: 4,
            render: (_v, _i, row) => {
                try {
                    const weeklyHours = JSON.parse(row.weeklyHours || "[]");
                    const total = Array.isArray(weeklyHours)
                        ? weeklyHours.reduce((s: number, w: any) => s + (Number(w?.hours) || 0), 0)
                        : 0;
                    return Number.isInteger(total) ? String(total) : total.toFixed(2);
                } catch {
                    return "-";
                }
            }
        },
        { key: "ptsSaved", label: "PTS Saved", width: 5, render: (value: boolean) => <StatusChip value={value} /> },
        { key: "cofyUpdate", label: "CoFY Updated", width: 6, render: (value: boolean) => <StatusChip value={value} /> },
        { key: "citiTraining", label: "Trainings", width: 5, render: (value: boolean) => <StatusChip value={value} /> });

    const handlePrev = () => {
        setMonth((m) => subMonths(m, 1));
    };

    const handleNext = () => {

        setMonth((m) => addMonths(m, 1));
    };
    const monthTitle = format(month, "MMMM yyyy");
    return (<>
        <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <CircularProgress color="inherit" />
        </Backdrop>
        {errorMsg && (
            <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 2 }}>
                {errorMsg}
            </Alert>
        )}
        <TimesheetHeader title='' monthTitle={monthTitle} onPrev={handlePrev} onNext={handleNext} />
        <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                                    whiteSpace: "normal",
                                    width: `${col.width ?? 0}%`,
                                    borderRight: "1px solid rgba(0,0,0,0.12)",
                                    overflowWrap: "break-word",
                                    wordBreak: "break-word",
                                    padding: "6px 4px",
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
                                if (col.key === 'sno') {
                                    value = (page * rowsPerPage) + rowIndex + 1;
                                }

                                return (
                                    <TableCell key={col.key} align="center" sx={{
                                        fontSize: '10px',
                                        width: `${col.width ?? 0}%`,
                                        borderRight: "1px solid rgba(0,0,0,0.12)",
                                        whiteSpace: 'normal',
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: "6px 4px",
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

        <ResourseDialog
            open={openModal}
            onClose={handleCloseModal}
            selectedRow={selectedRow}
            year={format(month, "yyyy")}
            month={format(month, "MM")}
        />
    </>
    );
};

export default ResourseTable;
