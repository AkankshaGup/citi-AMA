import { Box, Typography } from "@mui/material";

export function TimesheetGridHeader() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 1,
        alignItems: "center",
        mb: 1,
        px: 0.5,
      }}
    >
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <Typography key={d} variant="body2" fontWeight={800} sx={{ textAlign: "center",fontFamily: "Inter, Roboto, sans-serif" }}>
          {d}
        </Typography>
      ))}
    </Box>
  );
}
