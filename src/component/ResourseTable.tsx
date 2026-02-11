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
} from "@mui/material";
import { api } from "../api/axiosInstance";
import StatusChip from "../generic/StatusChip";
import { getWeeksInCurrentMonth } from "../utils/dateUtils";

const tableData = [
    {
        "employeeId": "e1",
        "name": "Alice Admin",
        "email": "alice.admin@example.com",
        "role": "ADMIN",
        "soeId": "123",
        "location": "Pune",
        "assignmentStartDate": "2025-02-01",
        "timesheets": "[{\"workDate\": \"2026-02-08\", \"hoursLogged\": 8.00}, {\"workDate\": \"2026-02-09\", \"hoursLogged\": 8.00}, {\"workDate\": \"2026-02-10\", \"hoursLogged\": 8.00}, {\"workDate\": \"2026-02-11\", \"hoursLogged\": 4.00}]",
        "leaves": "[{\"comments\": \"Sick leave\", \"startDate\": \"2026-02-09\", \"leaveTypeId\": 1}]",
        "holidays": "[{\"date\": \"2026-02-22\", \"name\": \"Holi\", \"type\": \"1\"}]",
        "totalHours": 28,
        "numberOfLeaves": 1,
        "numberOfHalfDays": 1,
        "numberOfHolidays": 1,
        "weeklyHours": "[{\"hours\": 40.00, \"weekStart\": \"2026-02-01\"}]",
        "ptsSaved": true,
        "cofyUpdate": false,
        "citiTraining": true
    },
    {
        "employeeId": "e2",
        "name": "normalemp1",
        "email": "emp1.admin@example.com",
        "role": "USER",
        "soeId": "12",
        "location": "Pune",
        "assignmentStartDate": "2025-02-01",
        "timesheets": "[{\"workDate\": \"2026-02-08\", \"hoursLogged\": 10.00}]",
        "leaves": "[{\"comments\": \"Sick leave\", \"startDate\": \"2026-02-10\", \"leaveTypeId\": 1}, {\"comments\": \"Sick leave\", \"startDate\": \"2026-02-11\", \"leaveTypeId\": 1}]",
        "holidays": "[{\"date\": \"2026-02-22\", \"name\": \"Holi\", \"type\": \"1\"}]",
        "totalHours": 10,
        "numberOfLeaves": 2,
        "numberOfHalfDays": 0,
        "numberOfHolidays": 1,
        "weeklyHours": "[]",
        "ptsSaved": false,
        "cofyUpdate": true,
        citiTraining: true
    }
];

const ResourseTable: React.FC = () => {
    const [resourceData, setResourceData] = useState(tableData);
    const totalWeeks = getWeeksInCurrentMonth();
    const fetchTeamResources = async () => {
        try {
            const res = await api.get("/sows/manager/");
            setResourceData(res.data);

        } catch (err) {
            setResourceData(tableData); // fallback to static data on error
        }
    }
    useEffect(() => {
        fetchTeamResources();
    }, []);
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


    return (
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
                    {resourceData.map((row, rowIndex) => (
                        <TableRow key={row.employeeId || rowIndex}>
                            {columns.map((col) => {
                                const value = (row as any)[col.key];

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
                                            : value ?? "-"}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ResourseTable;
