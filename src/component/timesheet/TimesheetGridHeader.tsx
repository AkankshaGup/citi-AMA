import { Box, Typography } from "@mui/material";

export function TimesheetGridHeader() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "220px repeat(7, 1fr) 84px",
        gap: 1,
        alignItems: "center",
        mb: 1,
        px: 0.5,
      }}
    >
      <Typography variant="caption" fontWeight={800}>
        Week
      </Typography>

      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <Typography key={d} variant="caption" fontWeight={800} sx={{ textAlign: "center" }}>
          {d}
        </Typography>
      ))}

      <Typography variant="caption" fontWeight={800} sx={{ textAlign: "center" }}>
        Total
      </Typography>
    </Box>
  );
}
