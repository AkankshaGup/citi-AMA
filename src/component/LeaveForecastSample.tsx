
import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Button,
  Stack,
  Chip,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";

import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addWeeks,
  addDays,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  getDay,
} from "date-fns";

type DayCode = "8" | "4" | "12" | "L" | "H" | "";
type WeekRow = { weekStart: Date; weekEnd: Date; days: Date[] };

const OPTIONS: DayCode[] = ["8", "4", "12", "L", "H"];

// Predefined holidays (YYYY-MM-DD)
const HOLIDAYS: Record<string, true> = {
  "2026-02-05": true,
  "2026-02-19": true,
  "2026-03-08": true,
};

const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
const isHoliday = (d: Date) => !!HOLIDAYS[dayKey(d)];
const isWeekend = (d: Date) => {
  const dow = getDay(d); // 0=Sun..6=Sat
  return dow === 0 || dow === 6;
};

function getWeeksForMonth(monthDate: Date): WeekRow[] {
  const ms = startOfMonth(monthDate);
  const me = endOfMonth(monthDate);

  let cursor = startOfWeek(ms, { weekStartsOn: 1 }); // Monday
  const last = endOfWeek(me, { weekStartsOn: 1 });

  const weeks: WeekRow[] = [];
  while (!isAfter(cursor, last)) {
    const ws = cursor;
    const we = endOfWeek(ws, { weekStartsOn: 1 });
    const intersects = !(isBefore(we, ms) || isAfter(ws, me));
    if (intersects) {
      const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
      weeks.push({ weekStart: ws, weekEnd: we, days });
    }
    cursor = addWeeks(cursor, 1);
  }
  return weeks;
}

function codeToHours(code: DayCode): number {
  if (code === "8") return 8;
  if (code === "4") return 4;
  if (code === "12") return 12;
  return 0;
}

export default function LeaveForecastSample() {
  const [month, setMonth] = React.useState<Date>(new Date());
  const [values, setValues] = React.useState<Record<string, DayCode>>({});

  const weeks = React.useMemo(() => getWeeksForMonth(month), [month]);
  const monthTitle = format(month, "MMMM yyyy");

  // Prefill holidays for current month as "H"
  React.useEffect(() => {
    setValues((prev) => {
      const next = { ...prev };
      for (const w of weeks) {
        for (const d of w.days) {
          if (!isSameMonth(d, month)) continue;
          if (isHoliday(d)) next[dayKey(d)] = "H";
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthTitle]);

  const handlePrev = () => setMonth((m) => subMonths(m, 1));
  const handleNext = () => setMonth((m) => addMonths(m, 1));

  const isDisabledDay = (d: Date) => isHoliday(d) || isWeekend(d);

  const setDayValue = (d: Date, code: DayCode) => {
    if (!isSameMonth(d, month)) return;
    if (isDisabledDay(d)) return;
    setValues((prev) => ({ ...prev, [dayKey(d)]: code }));
  };

  const weekTotal = (w: WeekRow) =>
    w.days.reduce((sum, d) => {
      if (!isSameMonth(d, month)) return sum;
      return sum + codeToHours(values[dayKey(d)] ?? "");
    }, 0);

  const buildPayloadForMonth = () => {
    const monthKey = format(month, "yyyy-MM");
    return {
      month: monthKey,
      weeks: weeks.map((w) => ({
        weekStart: dayKey(w.weekStart),
        weekEnd: dayKey(w.weekEnd),
        totalHours: weekTotal(w),
        days: w.days
          .filter((d) => isSameMonth(d, month)) // only current month dates
          .map((d) => ({
            date: dayKey(d),
            value: values[dayKey(d)] ?? (isHoliday(d) ? "H" : ""),
          })),
      })),
    };
  };

  const handleSave = () => {
    const payload = buildPayloadForMonth();
    localStorage.setItem(`timesheet:${payload.month}`, JSON.stringify(payload));
    console.log("Saved draft:", payload);
  };

  const handleSubmit = () => {
    const payload = buildPayloadForMonth();
    console.log("Submit payload:", payload);
    // TODO: API call
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1100, mx: "auto", mt: 4, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Timesheet
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={handlePrev} aria-label="previous month">
            <ChevronLeftIcon />
          </IconButton>

          <Typography sx={{ minWidth: 180, textAlign: "center" }} fontWeight={700}>
            {monthTitle}
          </Typography>

          <IconButton onClick={handleNext} aria-label="next month">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip size="small" label="H = Holiday (blocked)" color="info" variant="outlined" />
        <Chip size="small" label="Sat/Sun blocked" variant="outlined" />
        <Chip size="small" label="L = Leave" color="warning" variant="outlined" />
      </Box>

      {/* One-time header row */}
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

      {/* Weeks: LEFT range, RIGHT day cells */}
      <Stack spacing={1.25}>
        {weeks.map((w) => (
          <Box
            key={dayKey(w.weekStart)}
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
                {format(w.weekStart, "dd/MM/yyyy")}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                to {format(w.weekEnd, "dd/MM/yyyy")}
              </Typography>
            </Box>

            {/* RIGHT: day boxes */}
            {w.days.map((d) => {
              // only show current month dates; keep grid slot empty for alignment
              if (!isSameMonth(d, month)) return <Box key={dayKey(d)} />;

              const k = dayKey(d);
              const holiday = isHoliday(d);
              const weekend = isWeekend(d);
              const disabled = holiday || weekend;

              const val: DayCode = values[k] ?? (holiday ? "H" : "");

              return (
                <Box
                  key={k}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 0.75,
                    minHeight: 64, // compact
                    bgcolor: disabled ? "action.disabledBackground" : "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ lineHeight: 1.1, opacity: 0.85 }}>
                    {format(d, "dd MMM")}
                  </Typography>

                  <FormControl fullWidth size="small">
                    <Select
                      value={val}
                      displayEmpty
                      disabled={disabled}
                      onChange={(e) => setDayValue(d, e.target.value as DayCode)}
                      sx={{
                        "& .MuiSelect-select": { py: 0.75 },
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
              {weekTotal(w)}
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Actions */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSave}>
          Save
        </Button>
        <Button variant="contained" endIcon={<SendIcon />} onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Paper>
  );
}
