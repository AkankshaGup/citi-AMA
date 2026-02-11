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
        const columns: { key: string; label: string; render?: (v: any, i?: number, row?: any) => React.ReactNode }[] = [
  {
    key: "sno",
    label: "S.No",
    render: (_v, i) => (i ?? 0) + 1,
  },
  {
    key: "location",
    label: "Location",
  },
  {
    key: "employeeId",
    label: "Emp ID",
  },
  {
    key: "soeId",
    label: "SOE ID",
  },
  {
    key: "name",
    label: "Resource Name",
  },
  {
    key: "assignmentStartDate",
    label: "Start Date",
  },
  {
    key: "numberOfHalfDays",
    label: "Half Day",
  },
  {
    key: "numberOfLeaves",
    label: "Leave",
  },
  {
    key: "numberOfHolidays",
    label: "Holiday",
  },
  {
  key: "ptsSaved",
  label: "Is PTS Saved till Month End",
  render: (value: boolean) => <StatusChip value={value} />,
},
{
  key: "cofyUpdate",
  label: "CoFY Updated / Consent Uploaded",
  render: (value: boolean) => <StatusChip value={value} />,
},
{
  key: "citiTraining",
  label: "Citi Trainings Completed",
  render: (value: boolean) => <StatusChip value={value} />,
},
];

  return (
    <TableContainer component={Paper}>
      <Table size="small">
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
              fontSize: "14px",
              color: "#000",
              whiteSpace: "nowrap",
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
                  <TableCell key={col.key}>
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
