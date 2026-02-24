// LeaveForecastPage.tsx
import * as React from "react";
import { Alert, Backdrop, CircularProgress, Divider, Paper, Snackbar, Stack } from "@mui/material";
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
import { auth } from "../auth/auth";
import { api } from "../api/axiosInstance";
import axios from "axios";

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

function getAxiosErrMsg(err: unknown, fallback: string) {
  if (!axios.isAxiosError(err)) return fallback;
  const data: any = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return String(data.message);
  return err.message || fallback;
}

type ApiTimesheet = { workDate: string; hoursLogged: number };
type ApiLeave = { startDate: string };
type ApiHoliday = { date: string; name: string; type?: string };

type GetApiItem = {
  employeeId: string;
  sowId: string;
  timesheets: string;
  leaves: string;
  holidays: string;
};

type GetApiResponse = { content: GetApiItem[] } | GetApiItem;

type SubmitPayload = {
  employeeId: string;
  leaveForecast: { date: string }[];
  timesheet: { date: string; hours: number }[];
};

// POST using axios
async function postTimesheetSave(payload: SubmitPayload) {
  const res = await api.post("/public/timesheets/save", payload);
  return res.data;
}

// GET using axios
async function fetchLeaveForecastApi(userId: string, monthKey: string): Promise<GetApiResponse> {
  const res = await api.get<GetApiResponse>("/public/userDashBoard", {
    params: { userId, month: monthKey },
  });
  return res.data;
}

export default function LeaveForecastPage() {
  const user = auth.getUser();
  const employeeId = user.userId; // submit payload
  const userId = user.userId; // GET param

  const currentMonthStart = React.useMemo(() => startOfMonth(new Date()), []);
  const [month, setMonth] = React.useState<Date>(currentMonthStart);

  const [values, setValues] = React.useState<Record<string, DayCode>>({});
  const [holidayMap, setHolidayMap] = React.useState<Record<string, string>>({});
  const [systemValueMap, setSystemValueMap] = React.useState<Record<string, DayCode>>({}); // H/W defaults only

  const [loading, setLoading] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const weeks = React.useMemo(() => getWeeksForMonth(month), [month]);
  const monthTitle = format(month, "MMMM yyyy");
  const monthKey = format(month, "yyyy-MM");

  const isHoliday = React.useCallback((d: Date) => !!holidayMap[dayKey(d)], [holidayMap]);
  const isDisabledDay = React.useCallback((d: Date) => isHoliday(d) || isWeekend(d), [isHoliday]);

  // Only block edits for previous months (holiday/weekend are editable)
  const isDisabledNotWeekend = React.useCallback(
    (d: Date) => {
      const isPrevMonth = isBefore(startOfMonth(d), currentMonthStart);
      return isPrevMonth;
    },
    [currentMonthStart]
  );

  const holidayName = React.useCallback((d: Date) => holidayMap[dayKey(d)], [holidayMap]);

  const loadMonth = React.useCallback(
    async (targetMonth: Date) => {
      const key = format(targetMonth, "yyyy-MM");
      setLoading(true);
      setErrorMsg(null);

      setValues({});
      setHolidayMap({});
      setSystemValueMap({});

      try {
        // const resp = await fetchLeaveForecastMock(employeeId, key);
        const resp = await fetchLeaveForecastApi(userId, key);

        const item: GetApiItem | undefined =
          resp && typeof resp === "object" && "content" in resp
            ? (resp as { content: GetApiItem[] }).content?.[0]
            : (resp as GetApiItem);

        if (!item) return;

        const apiTimesheets = safeJsonParse<ApiTimesheet[]>(item.timesheets, []);
        const apiLeaves = safeJsonParse<ApiLeave[]>(item.leaves, []);
        const apiHolidays = safeJsonParse<ApiHoliday[]>(item.holidays, []);

        // 1) Holiday map for display only (date -> name)
        const hm: Record<string, string> = {};
        for (const h of apiHolidays) {
          if (!h?.date) continue;
          hm[h.date] = h.name || "Holiday";
        }
        setHolidayMap(hm);

        // 2) Build values with priority: Hours > Leave > Defaults(H/W)
        const nextValues: Record<string, DayCode> = {};
        const nextSystem: Record<string, DayCode> = {};

        // A) apply hours FIRST (even if it's a holiday date, hours must win)
        for (const t of apiTimesheets) {
          if (!t?.workDate) continue;
          const d = new Date(t.workDate);
          if (!isSameMonth(d, targetMonth)) continue;

          const code = hoursToCode(Number(t.hoursLogged));
          if (code) nextValues[t.workDate] = code;
        }

        // B) apply leaves SECOND (leave wins over holiday/weekend default)
        for (const l of apiLeaves) {
          if (!l?.startDate) continue;
          const d = new Date(l.startDate);
          if (!isSameMonth(d, targetMonth)) continue;

          nextValues[l.startDate] = "L";
        }

        // C) fill system defaults only for dates still empty
        for (const w of weeks) {
          for (const d of w.days) {
            if (!isSameMonth(d, targetMonth)) continue;

            const k = dayKey(d);
            if (nextValues[k]) continue; // hours/leave already present -> DO NOT set H/W

            if (hm[k]) {
              nextValues[k] = "H";
              nextSystem[k] = "H";
              continue;
            }

            if (isWeekend(d)) {
              nextValues[k] = "W";
              nextSystem[k] = "W";
            }
          }
        }

        setSystemValueMap(nextSystem);
        setValues(nextValues);
      } catch (e) {
        setErrorMsg(getAxiosErrMsg(e, "Failed to load month data"));
      } finally {
        setLoading(false);
      }
    },
    [employeeId, userId, weeks]
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
    if (isDisabledNotWeekend(d)) return;
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

    // - ignore H/W if unchanged
    // - if user changes H/W to hours/leave => send it
    const leaveForecast = Object.entries(values)
      .filter(([date, v]) => v === "L" && systemValueMap[date] !== "L")
      .map(([date]) => ({ date }));

    const timesheet = Object.entries(values)
      .filter(([date, v]) => (v === "8" || v === "4" || v === "12") && systemValueMap[date] !== v)
      .map(([date, v]) => ({ date, hours: Number(v) }));

    const payload: SubmitPayload = { employeeId, leaveForecast, timesheet };

    try {
      setSubmitLoading(true);
      setErrorMsg(null);
      await postTimesheetSave(payload);
      setSuccessOpen(true);
    } catch (e) {
      setErrorMsg(getAxiosErrMsg(e, "Failed to submit timesheet"));
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

      <TimesheetHeader monthTitle={monthTitle} onPrev={handlePrev} onNext={handleNext} navDisabled={loading || submitLoading} />

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