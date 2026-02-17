import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
import { format, isSameMonth } from "date-fns";
import type { DayCode } from "../../types/timesheetTypes";
import { OPTIONS } from "../../utils/timesheetUtils";
import { dayKey } from "../../utils/dateUtils";

export function DayCell(props: {
  date: Date;
  month: Date;
  value: DayCode;
  disabled: boolean;
  isLeave: boolean;
  onChange: (date: Date, val: DayCode) => void;
}) {
  const { date, month, value, disabled, isLeave, onChange } = props;

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
        bgcolor: disabled ? "action.disabledBackground" : isLeave ? "warning.light" : "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Typography variant="caption" sx={{ lineHeight: 1.1, opacity: 0.85 }}>
        {format(date, "dd MMM")}
      </Typography>

      <FormControl fullWidth size="small">
        <Select
          value={value}
          displayEmpty
          disabled={disabled}
          onChange={(e) => onChange(date, e.target.value as DayCode)}
          sx={{ "& .MuiSelect-select": { py: 0.75 } }}
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
