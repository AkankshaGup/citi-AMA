import * as React from "react";
import { Alert, Backdrop, CircularProgress, Divider, Paper, Snackbar, Stack } from "@mui/material";
import { addMonths, subMonths, format, isBefore, isSameMonth, startOfMonth } from "date-fns";

import type { DayCode } from "../types/timesheetTypes";
//import { fetchLeaveForecastMock } from "../mock/mockData"; // keep import for now (comment usage below)

import { dayKey, getRequiredDatesForMonth, getWeeksForMonth } from "../utils/dateUtils";
import { isWeekend, weekTotal as calcWeekTotal } from "../utils/timesheetUtils";

import { TimesheetHeader } from "./timesheet/TimesheetHeader";
import { TimesheetLegend } from "./timesheet/TimesheetLegend";
import { TimesheetGridHeader } from "./timesheet/TimesheetGridHeader";
import { WeekRow } from "./timesheet/WeekRow";
import { ActionsBar } from "./timesheet/ActionsBar";
import { auth } from "../auth/auth";

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

type GetApiItem = {
  employeeId: string;
  sowId: string;
  timesheets: string; // JSON string
  leaves: string; // JSON string
  holidays: string; // JSON string
};

type GetApiResponse = {
  content: GetApiItem[];
};

type SubmitPayload = {
  employeeId: string;
  leaveForecast: { date: string }[];
  timesheet: { date: string; hours: number }[];
};

async function postTimesheetSave(payload: SubmitPayload) {
  const res = await fetch("public/timesheets/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchLeaveForecastApi(employeeId: string, monthKey: string): Promise<GetApiResponse> {
  const url = `user/userDashBoard?userId=${encodeURIComponent(employeeId)}&month=${encodeURIComponent(monthKey)}`;
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `GET failed (${res.status})`);
  }

  return (await res.json()) as GetApiResponse;
}

export default function LeaveForecastPage() {
  //const employeeId = "AIPL12345"; // used in submit payload
  const user = auth.getUser();
  const employeeId = user.userId; // used in submit payload

  const currentMonthStart = React.useMemo(() => startOfMonth(new Date()), []);
  const [month, setMonth] = React.useState<Date>(currentMonthStart);

  const [values, setValues] = React.useState<Record<string, DayCode>>({});
  const [holidayMap, setHolidayMap] = React.useState<Record<string, string>>({});

  const [loading, setLoading] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const weeks = React.useMemo(() => getWeeksForMonth(month), [month]);
  const monthTitle = format(month, "MMMM yyyy");
  const monthKey = format(month, "yyyy-MM");

  const isHoliday = React.useCallback((d: Date) => !!holidayMap[dayKey(d)], [holidayMap]);

  const isDisabledDay = React.useCallback((d: Date) => isHoliday(d) || isWeekend(d), [isHoliday]);

  const holidayName = React.useCallback((d: Date) => holidayMap[dayKey(d)], [holidayMap]);

  const loadMonth = React.useCallback(
    async (targetMonth: Date) => {
      const key = format(targetMonth, "yyyy-MM");
      setLoading(true);
      setErrorMsg(null);

      // clear previous month state
      setValues({});
      setHolidayMap({});

      try {
        // const resp = await fetchLeaveForecastMock(employeeId, key); 
        const resp = await fetchLeaveForecastApi(employeeId, key);

        const item = resp.content?.[0];
        if (!item) return;

        const apiTimesheets = safeJsonParse<ApiTimesheet[]>(item.timesheets, []);
        const apiLeaves = safeJsonParse<ApiLeave[]>(item.leaves, []);
        const apiHolidays = safeJsonParse<ApiHoliday[]>(item.holidays, []);

        // 1) holiday map (yyyy-MM-dd -> name)
        const hm: Record<string, string> = {};
        for (const h of apiHolidays) {
          if (!h?.date) continue; // API date is yyyy-MM-dd
          hm[h.date] = h.name || "Holiday";
        }
        setHolidayMap(hm);

        // 2) values (hours + leaves)
        const nextValues: Record<string, DayCode> = {};

        for (const t of apiTimesheets) {
          if (!t?.workDate) continue;
          const d = new Date(t.workDate);
          if (!isSameMonth(d, targetMonth)) continue;

          const disabled = !!hm[t.workDate] || isWeekend(d);
          if (disabled) continue;

          nextValues[t.workDate] = hoursToCode(Number(t.hoursLogged));
        }

        for (const l of apiLeaves) {
          if (!l?.startDate) continue;
          const d = new Date(l.startDate);
          if (!isSameMonth(d, targetMonth)) continue;

          const disabled = !!hm[l.startDate] || isWeekend(d);
          if (disabled) continue;

          nextValues[l.startDate] = "L";
        }

        setValues(nextValues);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Failed to load month data");
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
    if (loading || submitLoading) return;
    setMonth((m) => subMonths(m, 1));
  };

  const handleNext = () => {
    if (loading || submitLoading) return;
    setMonth((m) => addMonths(m, 1));
  };

  const setDayValue = (d: Date, code: DayCode) => {
    if (!isSameMonth(d, month)) return;
    if (isDisabledDay(d)) return;
    setValues((prev) => ({ ...prev, [dayKey(d)]: code }));
  };

  const requiredDates = React.useMemo(() => getRequiredDatesForMonth(month, isDisabledDay), [month, isDisabledDay]);

  const hasAnyEmpty = React.useMemo(() => {
    return requiredDates.some((d) => (values[dayKey(d)] ?? "") === "");
  }, [requiredDates, values]);

  const isPrevMonth = React.useMemo(() => {
    return isBefore(startOfMonth(month), currentMonthStart);
  }, [month, currentMonthStart]);

  const saveDisabled = loading || submitLoading || hasAnyEmpty || isPrevMonth;

  const handleSubmit = async () => {
    if (saveDisabled) return;

    const leaveForecast = Object.entries(values)
      .filter(([, v]) => v === "L")
      .map(([date]) => ({ date }));

    const timesheet = Object.entries(values)
      .filter(([, v]) => v === "8" || v === "4" || v === "12")
      .map(([date, v]) => ({ date, hours: Number(v) }));

    const payload = { employeeId, leaveForecast, timesheet };

    try {
      setSubmitLoading(true);
      setErrorMsg(null);
      await postTimesheetSave(payload);
      setSuccessOpen(true);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to submit timesheet");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1100, mx: "auto", mt: 4, p: 3, position: "relative" }}>
      <Backdrop
        open={loading || submitLoading}
        sx={{
          position: "absolute",
          zIndex: (t) => t.zIndex.drawer + 1,
          color: "#fff",
          borderRadius: 2,
        }}
      >
        <CircularProgress />
      </Backdrop>

      <TimesheetHeader
        monthTitle={monthTitle}
        onPrev={handlePrev}
        onNext={handleNext}
        navDisabled={loading || submitLoading}
      />

      <Divider sx={{ my: 2 }} />

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

      <Divider sx={{ my: 2 }} />
      <TimesheetLegend />
      <ActionsBar onSubmit={handleSubmit} saveDisabled={saveDisabled} />

      {/* Success banner */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessOpen(false)}>
          Leave forecast submitted successfully.
        </Alert>
      </Snackbar>

      {/* Error banner */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
