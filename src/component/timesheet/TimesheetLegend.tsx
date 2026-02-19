import { Box, Chip } from "@mui/material";

export function TimesheetLegend() {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
      <Chip size="small" label="H = Holiday (blocked)" color="info" variant="outlined" />
      <Chip size="small" label="Sat/Sun" variant="outlined" />
      <Chip size="small" label="L = Leave" color="warning" variant="outlined" />
    </Box>
  );
}
