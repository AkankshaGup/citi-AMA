import { getDay, isAfter, startOfMonth, endOfMonth, addDays, isSameMonth, parseISO } from "date-fns";
import type { ApiPayload, DayCode, MockApiResponse, WeekRow, SubmitPayload } from "../types/timesheetTypes";
import { apiDayKey, dayKey } from "./dateUtils";

export const OPTIONS: DayCode[] = ["8", "4", "12", "L","H", "W"];

export function buildSubmitPayload(params: {
  employeeId: string;
  month: Date;
  values: Record<string, DayCode>;
  isDisabledDay: (d: Date) => boolean; // holidays/weekends blocked
}): SubmitPayload {
  const { employeeId, month, values, isDisabledDay } = params;

  const payload: SubmitPayload = {
    employeeId,
    leaveForecast: [],
    timesheet: [],
  };

  const ms = startOfMonth(month);
  const me = endOfMonth(month);

  for (let d = ms; !isAfter(d, me); d = addDays(d, 1)) {
    if (isDisabledDay(d)) continue; // skip holiday/weekend

    const k = dayKey(d);
    const v: DayCode = values[k] ?? "";

    if (v === "L") {
      payload.leaveForecast.push({ date: k }); // yyyy-MM-dd
    } else if (v === "8" || v === "4" || v === "12") {
      payload.timesheet.push({ date: k, hours: Number(v) }); // hours as number
    }
  }

  return payload;
}


export function codeToHours(code: DayCode): number {
  if (code === "8") return 8;
  if (code === "4") return 4;
  if (code === "12") return 12;
  return 0;
}
export function hoursToCode(h: number): DayCode {
  if (h === 8) return "8";
  if (h === 4) return "4";
  if (h === 12) return "12";
  return "";
}

export function isWeekend(d: Date) {
  const dow = getDay(d);
  return dow === 0 || dow === 6;
}

export function safeParseISO(s: string): Date | null {
  try {
    const d = parseISO(s);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** parse "d-M-yyyy" like "1-12-2025" */
export function parseApiKeyToDate(k: string): Date | null {
  const parts = k.split("-").map((x) => x.trim());
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((p) => Number(p));
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

export function weekTotal(w: WeekRow, month: Date, values: Record<string, DayCode>) {
  return w?.days.reduce((sum, d) => {
    if (!isSameMonth(d, month)) return sum;
    return sum + codeToHours(values[dayKey(d)] ?? "");
  }, 0);
}

export function buildApiObject(params: {
  month: Date;
  values: Record<string, DayCode>;
  isHoliday: (d: Date) => boolean;
}): ApiPayload {
  const { month, values, isHoliday } = params;
  const payload: ApiPayload = { timesheet: {}, leaves: [] };

  const ms = startOfMonth(month);
  const me = endOfMonth(month);

  for (let d = ms; !isAfter(d, me); d = addDays(d, 1)) {
    const k = dayKey(d);
    const v: DayCode = values[k] ?? (isHoliday(d) ? "H" : "");

    if (v === "8" || v === "4" || v === "12") {
      payload.timesheet[apiDayKey(d)] = codeToHours(v);
    } else if (v === "L") {
      payload.leaves.push({ date: dayKey(d) });
    }
  }
  return payload;
}

export function parseDdMmYyyyToDate(s: string): Date | null {
  const parts = s.split("-").map((x) => x.trim());
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((p) => Number(p));
  if (!dd || !mm || !yyyy) return null;

  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

export function mergeMockIntoValues(params: {
  month: Date;
  prev: Record<string, DayCode>;
  mock: MockApiResponse;
  isDisabledDay: (d: Date) => boolean;
}): Record<string, DayCode> {
  const { month, prev, mock, isDisabledDay } = params;
  const next = { ...prev };

  // timesheet
  for (const [k, hrs] of Object.entries(mock.timesheet)) {
    const parsed = parseApiKeyToDate(k);
    if (!parsed) continue;
    if (!isSameMonth(parsed, month)) continue;
    if (isDisabledDay(parsed)) continue;
    next[dayKey(parsed)] = hoursToCode(hrs);
  }

  // leaves
  for (const item of mock.leaves) {
    const d = safeParseISO(item.date);
    if (!d) continue;
    if (!isSameMonth(d, month)) continue;
    if (isDisabledDay(d)) continue;
    next[dayKey(d)] = "L";
  }

  return next;
}

