import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ResourseTable from "./ResourseTable";
import { api } from "../api/axiosInstance";
import { useEffect, useState } from "react";
import { auth } from "../auth/auth";
import { Typography } from "@mui/material";
import { mockTeamData } from "../metadata/metadata";

interface TeamResource {
	sowId: string;
	sowName: string;
	managerId: string;
}

export default function ManagerDashboard() {
	const [teamData, setTeamData] = useState<TeamResource[]>([]);
	const [selectedSow, setSelectedSow] = useState<TeamResource | null>(null);
	const user = auth.getUser();

	const fetchTeam = async () => {
		try {
			const res = await api.get(`public/sows/manager/${user.userId}`);
			setTeamData(res.data);
			setSelectedSow(res.data[0] ?? null);
		} catch {
			setTeamData(mockTeamData);
			setSelectedSow(mockTeamData[0] ?? null);
		}
	};

	useEffect(() => {
		fetchTeam();
	}, []);

	return (
		<>
			<Box display="flex" justifyContent="space-between" marginBottom={4}>
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
					sx={{ width: 300 }}
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
				>
					Export
				</Button>
			</Box>

			{/* ✅ Pass only sowId to table */}
			{selectedSow?.sowId && (
				<ResourseTable sowId={selectedSow.sowId} />
			)}
		</>
	);
}
