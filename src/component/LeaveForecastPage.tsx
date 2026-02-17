import * as React from "react";
import { Backdrop, CircularProgress, Divider, Paper, Stack } from "@mui/material";
import { addMonths, subMonths, format, isBefore, isSameMonth, startOfMonth } from "date-fns";

import type { DayCode } from "../types/timesheetTypes";
import { fetchLeaveForecastMock } from "../mock/mockData";

import { dayKey, getRequiredDatesForMonth, getWeeksForMonth } from "../utils/dateUtils";
import { isWeekend, weekTotal as calcWeekTotal } from "../utils/timesheetUtils";

import { TimesheetHeader } from "./timesheet/TimesheetHeader";
import { TimesheetLegend } from "./timesheet/TimesheetLegend";
import { TimesheetGridHeader } from "./timesheet/TimesheetGridHeader";
import { WeekRow } from "./timesheet/WeekRow";
import { ActionsBar } from "./timesheet/ActionsBar";

/** safe JSON parse for API fields that are JSON strings */
function safeJsonParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

/** map numeric hours into DayCode */
function hoursToCode(h: number): DayCode {
  if (h === 8) return "8";
  if (h === 4) return "4";
  if (h === 12) return "12";
  return "";
}

type ApiTimesheet = { workDate: string; hoursLogged: number };
type ApiLeave = { comments?: string; startDate: string; leaveTypeId: number };
type ApiHoliday = { date: string; name: string; type?: string };

export default function LeaveForecastPage() {
  const employeeId = "AIPL12345"; // use your real employee id here

  const upcomingMonthStart = React.useMemo(() => startOfMonth(addMonths(new Date(), 1)), []);
  const [month, setMonth] = React.useState<Date>(upcomingMonthStart);

  // selection values: yyyy-MM-dd -> DayCode (8/4/12/L/"")
  const [values, setValues] = React.useState<Record<string, DayCode>>({});

  // holiday map: yyyy-MM-dd -> name (for UI display + blocking)
  const [holidayMap, setHolidayMap] = React.useState<Record<string, string>>({});

  const [loading, setLoading] = React.useState(false);

  const weeks = React.useMemo(() => getWeeksForMonth(month), [month]);
  const monthTitle = format(month, "MMMM yyyy");
  const monthKey = format(month, "yyyy-MM");

  const isHoliday = React.useCallback((d: Date) => !!holidayMap[dayKey(d)], [holidayMap]);

  const isDisabledDay = React.useCallback(
    (d: Date) => isHoliday(d) || isWeekend(d),
    [isHoliday]
  );

  const holidayName = React.useCallback((d: Date) => holidayMap[dayKey(d)], [holidayMap]);

  const loadMonth = React.useCallback(
    async (targetMonth: Date) => {
      const key = format(targetMonth, "yyyy-MM");
      setLoading(true);

      // clear previous month state
      setValues({});
      setHolidayMap({});

      try {
        const resp = await fetchLeaveForecastMock(employeeId, key);

        const item = resp.content?.[0];
        if (!item) {
          // nothing for this month
          return;
        }

        const apiTimesheets = safeJsonParse<ApiTimesheet[]>(item.timesheets, []);
        const apiLeaves = safeJsonParse<ApiLeave[]>(item.leaves, []);
        const apiHolidays = safeJsonParse<ApiHoliday[]>(item.holidays, []);

        // 1) Build holiday map (yyyy-MM-dd -> name)
        const hm: Record<string, string> = {};
        for (const h of apiHolidays) {
          // API gives yyyy-MM-dd already
          if (!h?.date) continue;
          hm[h.date] = h.name || "Holiday";
        }
        setHolidayMap(hm);

        // 2) Build values (hours + leaves)
        const nextValues: Record<string, DayCode> = {};

        // timesheets => 8/4/12
        for (const t of apiTimesheets) {
          if (!t?.workDate) continue;
          // only if same month (extra safety)
          const d = new Date(t.workDate);
          if (!isSameMonth(d, targetMonth)) continue;

          // skip if holiday/weekend
          const disabled = !!hm[t.workDate] || isWeekend(d);
          if (disabled) continue;

          nextValues[t.workDate] = hoursToCode(Number(t.hoursLogged));
        }

        // leaves => L (using startDate as a single-day leave)
        for (const l of apiLeaves) {
          if (!l?.startDate) continue;
          const d = new Date(l.startDate);
          if (!isSameMonth(d, targetMonth)) continue;

          const disabled = !!hm[l.startDate] || isWeekend(d);
          if (disabled) continue;

          nextValues[l.startDate] = "L";
        }

        setValues(nextValues);
      } finally {
        setLoading(false);
      }
    },
    [employeeId]
  );

  React.useEffect(() => {
    void loadMonth(month);
  }, [monthKey, loadMonth]);

  const handlePrev = () => {
    if (loading) return;
    setMonth((m) => subMonths(m, 1));
  };

  const handleNext = () => {
    if (loading) return;
    setMonth((m) => addMonths(m, 1));
  };

  const setDayValue = (d: Date, code: DayCode) => {
    if (!isSameMonth(d, month)) return;
    if (isDisabledDay(d)) return;
    setValues((prev) => ({ ...prev, [dayKey(d)]: code }));
  };

  const requiredDates = React.useMemo(
    () => getRequiredDatesForMonth(month, isDisabledDay),
    [month, isDisabledDay]
  );

  const hasAnyEmpty = React.useMemo(() => {
    return requiredDates.some((d) => (values[dayKey(d)] ?? "") === "");
  }, [requiredDates, values]);

  const isPrevMonth = isBefore(startOfMonth(month), upcomingMonthStart);
  const saveDisabled = loading || hasAnyEmpty || isPrevMonth;

  const handleSubmit = () => {
    // you said payload should be:
    // { employeeId, leaveForecast:[{date}], timesheet:[{date,hours}] }
    if (loading) return;

    const leaveForecast = Object.entries(values)
      .filter(([, v]) => v === "L")
      .map(([date]) => ({ date }));

    const timesheet = Object.entries(values)
      .filter(([, v]) => v === "8" || v === "4" || v === "12")
      .map(([date, v]) => ({ date, hours: Number(v) }));

    const payload = { employeeId, leaveForecast, timesheet };
    console.log("Submit payload:", payload);
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1100, mx: "auto", mt: 4, p: 3, position: "relative" }}>
      <Backdrop
        open={loading}
        sx={{
          position: "absolute",
          zIndex: (t) => t.zIndex.drawer + 1,
          color: "#fff",
          borderRadius: 2,
        }}
      >
        <CircularProgress />
      </Backdrop>

      <TimesheetHeader monthTitle={monthTitle} onPrev={handlePrev} onNext={handleNext} navDisabled={loading} />

      <Divider sx={{ my: 2 }} />

      <TimesheetLegend />
      <TimesheetGridHeader />

      <Stack spacing={1.25}>
        {weeks.map((w) => (
          <WeekRow
            key={dayKey(w.weekStart)}
            week={w}
            month={month}
            values={values}
            isHoliday={(d) => !!holidayMap[dayKey(d)]}
            holidayName={holidayName}
            isWeekend={isWeekend}
            weekTotal={calcWeekTotal(w, month, values)}
            onChangeDay={setDayValue}
          />
        ))}
      </Stack>

      <ActionsBar onSubmit={handleSubmit} saveDisabled={saveDisabled} />
    </Paper>
  );
}
