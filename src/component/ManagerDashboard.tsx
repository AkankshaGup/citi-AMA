import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ResourseTable from './ResourseTable';
import { api } from "../api/axiosInstance";
import { use, useEffect, useState } from 'react';
import { auth } from "../auth/auth";

const teamRes = [
    {
        "sowId": "SOW-0001-0000-0000-0000-000000000001",
        "sowName": "Digital Payments Platform",
        "managerId": "MGR-001-0000-0000-0000-000000000001"
    },
    {
        "sowId": "SOW-0002-0000-0000-0000-000000000002",
        "sowName": "Merchant Risk & Compliance",
        "managerId": "MGR-001-0000-0000-0000-000000000001"
    }
]
interface TeamResource {
    sowId: string;
    sowName: string;
    managerId: string;
}

export default function ManagerDashboard() {
    const [teamData, setTeamData] = useState<TeamResource[] | null>(null);
    const user = auth.getUser();
    const fetchTeam = async () => {
        try {
            const res = await api.get("/sows/manager/" + user.userId);
            setTeamData(res.data);

        } catch (err) {
            setTeamData(teamRes); // fallback to static data on error
        }
    }
    useEffect(() => {
        fetchTeam();
    }, []);

    return (<>
        <Box display='flex' justifyContent='space-between'>
            <Autocomplete
                disablePortal
                getOptionLabel={(option) => option.sowName}
                options={teamData || []}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Select Team" size="small" />} />
            <Button variant="contained">Export</Button>
        </Box>
        <ResourseTable />
    </>
    );
}