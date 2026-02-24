import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
import { format, isBefore, isSameMonth, startOfMonth } from "date-fns";
import type { DayCode } from "../../types/timesheetTypes";
import { OPTIONS } from "../../utils/timesheetUtils";
import { dayKey } from "../../utils/dateUtils";

export function DayCell(props: {
  date: Date;
  month: Date;
  value: DayCode;
  disabled: boolean; // visual only (holiday/weekend)
  isLeave: boolean;
  holidayName?: string;
  isWeekend: boolean;
  isHoliday: boolean;
  onChange: (date: Date, val: DayCode) => void;
}) {
  const { date, month, value, disabled, isLeave, holidayName, isWeekend, isHoliday, onChange } = props;

  const isPastMonth = isBefore(startOfMonth(month), startOfMonth(new Date()));
  if (!isSameMonth(date, month)) return <Box />;

  // if a date is holiday/weekend it will be prefilled as H/W by LeaveForecastPage
  const displayValue = value ?? "";

  const isHolidayValue = displayValue === "H";
  const isWeekendValue = displayValue === "W";

  return (
    <Box
      key={dayKey(date)}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 0.75,
        minHeight: 64,
        bgcolor: isPastMonth
          ? "action.disabledBackground"
          : isHolidayValue
            ? "info.light"
            : disabled || isWeekend
              ? "action.disabledBackground"
              : displayValue === "4"
                ? "#f0b17e"
                : isLeave
                  ? "warning.light"
                  : "background.paper",
        display: "block",
      }}
    >
      <Typography variant="body2" sx={{ lineHeight: 1.1, opacity: 0.85 }}>
        {format(date, "dd MMM")}
        {holidayName ? ` - ${holidayName}` : ""}
      </Typography>

      <FormControl fullWidth size="small" variant="outlined">
        <Select
          value={displayValue}
          disabled={isPastMonth}
          displayEmpty
          onChange={(e) => onChange(date, e.target.value as DayCode)}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
            "& .MuiSelect-select": { py: 0.75 },

            ...(isPastMonth && { bgcolor: "grey.200" }),
            ...(!isPastMonth && isHolidayValue && { bgcolor: "info.light" }),
            ...(!isPastMonth && displayValue === "4" && { bgcolor: "#f0b17e" }),
            ...(!isPastMonth && disabled && { bgcolor: "grey.200" }),
          }}
        >
          <MenuItem value="">
            <em>Select</em>
          </MenuItem>

          {OPTIONS.map((opt) => {
            // Hide H if not holiday
            if (opt === "H" && !isHoliday) return null;

            // Hide W if not weekend
            if (opt === "W" && !isWeekend) return null;

            // Hide L if it's holiday OR weekend
            if (opt === "L" && (isHoliday || isWeekend)) return null;

            return (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
}