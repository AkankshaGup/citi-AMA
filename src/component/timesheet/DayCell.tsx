import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
import { format, isBefore, isSameMonth, startOfMonth } from "date-fns";
import type { DayCode } from "../../types/timesheetTypes";
import { OPTIONS } from "../../utils/timesheetUtils";
import { dayKey } from "../../utils/dateUtils";

export function DayCell(props: {
  date: Date;
  month: Date;
  value: DayCode;
  disabled: boolean; // now visual only
  isLeave: boolean;
  onChange: (date: Date, val: DayCode) => void;
}) {
  const { date, month, value, disabled, isLeave, onChange } = props;
  const isPastMonth = isBefore(startOfMonth(month), startOfMonth(new Date()));
  if (!isSameMonth(date, month)) return <Box />;

  return (
    <Box
      key={dayKey(date)}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 0.75,
        minHeight: 64,
        bgcolor:
          disabled || isPastMonth
            ? "action.disabledBackground"
            : value == "4"
              ? "#f0b17e"
              : isLeave
                ? "warning.light"
                : "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Typography variant="body2" sx={{ lineHeight: 1.1, opacity: 0.85 }}>
        {format(date, "dd MMM")}
      </Typography>

      <FormControl fullWidth size="small" variant="outlined">
        <Select
          value={value}
          disabled={isPastMonth}
          displayEmpty
          onChange={(e) => onChange(date, e.target.value as DayCode)}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSelect-select": {
              py: 0.75,
            },

            // Background conditions
            ...(value == "4" && {
              bgcolor: "#f0b17e",
            }),

            ...(disabled && {
              bgcolor: "grey.200",
            }),
          }}
        >

          <MenuItem value="">
            <em>Select</em>
          </MenuItem>
          {OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

    </Box>
  );
}
