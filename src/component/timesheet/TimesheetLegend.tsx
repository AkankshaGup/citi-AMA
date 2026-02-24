import { Box, Chip } from "@mui/material";

export function TimesheetLegend() {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
      <Chip size="small" label="H - Holiday" color="info" variant="outlined" />
      <Chip size="small" label="4 hrs - Half Leave" style={{ color: "#f0b17e", borderColor: "#f0b17e" }} variant="outlined" />
      <Chip size="small" label="L - Leave" color="warning" variant="outlined" />
    </Box>
  );
}
