import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { TimesheetHeader } from "./timesheet/TimesheetHeader.tsx";
import ResourseTable from "./ResourseTable";
import { api } from "../config/axiosInstance.ts";
import React, { useEffect, useState } from "react";
import { addMonths, subMonths, startOfMonth, format } from "date-fns";
import { auth } from "../auth/auth";
import { Typography, Button, Alert } from "@mui/material";

interface TeamResource {
	sowId: string;
	sowName: string;
	managerId: string;
}

export default function ManagerDashboard() {
	const currentMonthStart = React.useMemo(() => startOfMonth(new Date()), []);
	const [month, setMonth] = React.useState<Date>(currentMonthStart);
	const [teamData, setTeamData] = useState<TeamResource[]>([]);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [selectedSow, setSelectedSow] = useState<TeamResource | null>(null);

	const handleDownload = () => {
		if (!selectedSow) return;
		const yearStr = format(month, "yyyy");
		const monthStr = format(month, "MM");
		window.open(`http://localhost:8700/public/export/employee-reports?sowId=${selectedSow.sowId}&month=${yearStr}-${monthStr}`, "_blank");
	};
	const user = auth.getUser();

	const fetchTeam = async () => {
		setErrorMsg(null);
		try {
			const res = await api.get(`public/sows/manager/${user.userId}`);
			setTeamData(res.data);
			setSelectedSow(res.data[0] ?? null);
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : String(err));
		}
	};

	useEffect(() => {
		fetchTeam();
	}, []);

	const handlePrev = () => {
		setMonth((m) => subMonths(m, 1));
	};

	const handleNext = () => {

		setMonth((m) => addMonths(m, 1));
	};
	const monthTitle = format(month, "MMMM yyyy");
	return (
		<>
			<Box display="flex" justifyContent="space-between" marginBottom={4} marginTop={2}>
				<Autocomplete
					disablePortal
					options={teamData}
					value={selectedSow}
					onChange={(_, value) => setSelectedSow(value)}
					getOptionLabel={(option) => option.sowName}
					isOptionEqualToValue={(opt, val) => opt.sowId === val.sowId}
					renderOption={(props, option) => (
						<Typography {...props} fontSize={14}>
							{option.sowName}
						</Typography>
					)}
					sx={{ width: 380 }}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Select Team"
							size="small"
							sx={{
								"& .MuiInputBase-input": { fontSize: "14px" },
								"& .MuiInputLabel-root": { fontSize: "14px" },
							}}
						/>
					)}
				/>

				<Button
					variant="contained"
					sx={{
						background:
							"linear-gradient(90deg, #0B4DBA 0%, #0A3FA3 100%)",
					}}
					onClick={handleDownload} 
				>
					Export
				</Button>
			</Box>
			{errorMsg && (
				<Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 2 }}>
					{errorMsg}
				</Alert>
			)}
			{selectedSow?.sowId && (<><TimesheetHeader title='' monthTitle={monthTitle} onPrev={handlePrev} onNext={handleNext} />

				<ResourseTable sowId={selectedSow.sowId} month={month} /></>
			)}
		</>
	);
}
