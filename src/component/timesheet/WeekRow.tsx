import { Box, Typography } from "@mui/material";
import { format, isSameMonth } from "date-fns";

import type { DayCode, WeekRow as WeekRowType } from "../../types/timesheetTypes";
import { dayKey } from "../../utils/dateUtils";
import { DayCell } from "./DayCell";

export function WeekRow(props: {
  week: WeekRowType;
  month: Date;
  values: Record<string, DayCode>;
  isHoliday: (d: Date) => boolean;
  isWeekend: (d: Date) => boolean;
  holidayName?: (d: Date) => string | undefined; // ✅ NEW: holiday name getter
  weekTotal: number;
  onChangeDay: (d: Date, v: DayCode) => void;
}) {
  const { week, month, values, isHoliday, isWeekend, holidayName, weekTotal, onChangeDay } = props;

  return (
    <Box
      key={dayKey(week.weekStart)}
      sx={{
        display: "grid",
        gridTemplateColumns: "220px repeat(7, 1fr) 84px",
        gap: 1,
        alignItems: "stretch",
      }}
    >
      {/* LEFT: week range */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          px: 1,
          py: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
          {format(week.weekStart, "dd/MM/yyyy")}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.75 }}>
          to {format(week.weekEnd, "dd/MM/yyyy")}
        </Typography>
      </Box>

      {/* Day cells */}
      {week.days.map((d) => {
        if (!isSameMonth(d, month)) return <Box key={dayKey(d)} />;

        const k = dayKey(d);
        const holiday = isHoliday(d);
        const weekend = isWeekend(d);
        const disabled = holiday || weekend;

        const val: DayCode = values[k] ?? "";
        const isLeave = val === "L";

        // Holiday: show name on card, no dropdown
        if (holiday) {
          const name = holidayName?.(d) ?? "Holiday";
          return (
            <Box
              key={k}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 0.75,
                minHeight: 64,
                bgcolor: "info.light",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ lineHeight: 1.1, opacity: 0.85 }}>
                {format(d, "dd MMM")}
              </Typography>

              <Typography variant="caption" fontWeight={900} sx={{ lineHeight: 1.1 }}>
                {name}
              </Typography>

              <Typography variant="caption" sx={{ opacity: 0.75, lineHeight: 1.1 }}>
                (Holiday)
              </Typography>
            </Box>
          );
        }

        // Non-holiday: dropdown cell
        return (
          <DayCell
            key={k}
            date={d}
            month={month}
            value={val}
            disabled={disabled}
            isLeave={isLeave}
            onChange={onChangeDay}
          />
        );
      })}

      {/* Total */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 16,
          minHeight: 64,
        }}
      >
        {weekTotal}
      </Box>
    </Box>
  );
}
