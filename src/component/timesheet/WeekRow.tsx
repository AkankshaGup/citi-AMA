import { Box } from "@mui/material";
import { isSameMonth } from "date-fns";

import type { DayCode, WeekRow as WeekRowType } from "../../types/timesheetTypes";
import { dayKey } from "../../utils/dateUtils";
import { DayCell } from "./DayCell";

export function WeekRow(props: {
  week: WeekRowType;
  month: Date;
  values: Record<string, DayCode>;
  isHoliday: (d: Date) => boolean;
  isWeekend: (d: Date) => boolean;
  holidayName?: (d: Date) => string | undefined;
  weekTotal: number;
  onChangeDay: (d: Date, v: DayCode) => void;
}) {
  const { week, month, values, isHoliday, isWeekend, holidayName, onChangeDay } = props;

  return (
    <Box
      key={dayKey(week.weekStart)}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 1,
        alignItems: "stretch",
      }}
    >
      {week.days.map((d) => {
        if (!isSameMonth(d, month)) return <Box key={dayKey(d)} />;

        const k = dayKey(d);
        const raw = values[k] ?? "";
        const val: DayCode = raw === "" && isWeekend(d) ? "W" : raw;

        // Only consider it holiday/weekend visually if the VALUE is H/W
        const holiday = isHoliday(d) && val === "H";
        const weekend = isWeekend(d) && val === "W";
        const disabled = weekend;

        const isLeave = val === "L";

        return (
          <DayCell
            key={k}
            date={d}
            month={month}
            value={val}
            disabled={disabled}
            isLeave={isLeave}
            isWeekend={isWeekend(d)}
            isHoliday={isHoliday(d)}
            holidayName={isHoliday(d) ? holidayName?.(d) : undefined} // can still show name if you want
            onChange={onChangeDay}
          />
        );
      })}
    </Box>
  );
}