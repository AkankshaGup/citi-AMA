import * as React from "react";
import { Backdrop, CircularProgress, Divider, Paper, Stack } from "@mui/material";
import { addMonths, subMonths, format, isBefore, isSameMonth, startOfMonth } from "date-fns";

import type { DayCode } from "../types/timesheetTypes";
import { fetchTimesheetMockByMonth } from "../mock/mockData";
import { dayKey, getRequiredDatesForMonth, getWeeksForMonth } from "../utils/dateUtils";
import {
  buildApiObject,
  isWeekend,
  mergeMockIntoValues,
  weekTotal as calcWeekTotal,
  parseDdMmYyyyToDate,
  buildSubmitPayload,
} from "../utils/timesheetUtils";

import { TimesheetHeader } from "./timesheet/TimesheetHeader";
import { TimesheetLegend } from "./timesheet/TimesheetLegend";
import { TimesheetGridHeader } from "./timesheet/TimesheetGridHeader";
import { WeekRow } from "./timesheet/WeekRow";
import { ActionsBar } from "./timesheet/ActionsBar";

export default function LeaveForecastPage() {
  const userId = "USER_123";

  const upcomingMonthStart = React.useMemo(() => startOfMonth(addMonths(new Date(), 1)), []);
  const [month, setMonth] = React.useState<Date>(upcomingMonthStart);
  const [values, setValues] = React.useState<Record<string, DayCode>>({});
  const [loading, setLoading] = React.useState(false);

  const [holidayMap, setHolidayMap] = React.useState<Record<string, string>>({});

  const weeks = React.useMemo(() => getWeeksForMonth(month), [month]);
  const monthTitle = format(month, "MMMM yyyy");
  const monthKey = format(month, "yyyy-MM");

  const isHoliday = React.useCallback(
    (d: Date) => !!holidayMap[dayKey(d)],
    [holidayMap]
  );

  const isDisabledDay = React.useCallback(
    (d: Date) => isHoliday(d) || isWeekend(d),
    [isHoliday]
  );

  const loadMonth = React.useCallback(
    async (targetMonth: Date) => {
      const key = format(targetMonth, "yyyy-MM");
      setLoading(true);

      // clear
      setValues({});
      setHolidayMap({});

      try {
        const resp = await fetchTimesheetMockByMonth(userId, key);

        // build holiday map from API: "01-03-2026" -> yyyy-MM-dd
        const hm: Record<string, string> = {};
        for (const h of resp.holiday ?? []) {
          const d = parseDdMmYyyyToDate(h.date);
          if (!d) continue;
          if (!isSameMonth(d, targetMonth)) continue;
          hm[dayKey(d)] = h.name;
        }
        setHolidayMap(hm);

        // merge hours + leaves (holidays are handled via holidayMap, not values)
        setValues((prev) =>
          mergeMockIntoValues({
            month: targetMonth,
            prev,
            mock: resp,
            isDisabledDay: (d) => !!hm[dayKey(d)] || isWeekend(d),
          })
        );
      } finally {
        setLoading(false);
      }
    },
    [userId]
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

  const requiredDates = React.useMemo(() => getRequiredDatesForMonth(month, isDisabledDay), [month, isDisabledDay]);

  const hasAnyEmpty = React.useMemo(() => {
    return requiredDates.some((d) => (values[dayKey(d)] ?? "") === "");
  }, [requiredDates, values]);

  const isPrevMonth = isBefore(startOfMonth(month), upcomingMonthStart);
  const saveDisabled = loading || hasAnyEmpty || isPrevMonth;

  const handleSubmit = () => {
  if (loading) return;

  const payload = buildSubmitPayload({
    employeeId: "AIPL4262",
    month,
    values,
    isDisabledDay, // uses holidayMap + weekend logic in your component
  });

  console.log("Submit payload:", payload);
  // TODO: API call
};

  return (
    <Paper elevation={3} sx={{ maxWidth: "100%", mx: "auto", mt: 2, p: 3, position: "relative" }}>
      <Backdrop
        open={loading}
        sx={{ position: "absolute", zIndex: (t) => t.zIndex.drawer + 1, color: "#fff", borderRadius: 2 }}
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
            isHoliday={(d) => !!holidayMap[dayKey(d)]} //pass holiday bool
            isWeekend={isWeekend}
            holidayName={(d) => holidayMap[dayKey(d)]}
            weekTotal={calcWeekTotal(w, month, values)}
            onChangeDay={setDayValue}
          />
        ))}
      </Stack>

      <ActionsBar onSubmit={handleSubmit} saveDisabled={saveDisabled} />
    </Paper>
  );
}
