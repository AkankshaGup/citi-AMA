import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type Props = {
  title?: string;
  monthTitle: string;
  onPrev: () => void;
  onNext: () => void;
  navDisabled?: boolean; // ✅ NEW
};

export function TimesheetHeader({
  title = "Timesheet",
  monthTitle,
  onPrev,
  onNext,
  navDisabled = false, // ✅ default
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Prev */}
        <IconButton
          onClick={onPrev}
          aria-label="previous month"
          disabled={navDisabled} // ✅ HERE
        >
          <ChevronLeftIcon />
        </IconButton>

        <Typography
          sx={{ minWidth: 180, textAlign: "center" }}
          fontWeight={700}
        >
          {monthTitle}
        </Typography>

        {/* Next */}
        <IconButton
          onClick={onNext}
          aria-label="next month"
          disabled={navDisabled} // ✅ HERE
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
