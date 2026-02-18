import {
  addDays,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { WeekRow } from "../types/timesheetTypes";

export const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
export const apiDayKey = (d: Date) => format(d, "d-M-yyyy"); // "1-12-2025"

export function getWeeksForMonth(monthDate: Date): WeekRow[] {
  const ms = startOfMonth(monthDate);
  const me = endOfMonth(monthDate);

  let cursor = startOfWeek(ms, { weekStartsOn: 1 });
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

export function getRequiredDatesForMonth(
  month: Date,
  isDisabledDay: (d: Date) => boolean
): Date[] {
  const ms = startOfMonth(month);
  const me = endOfMonth(month);
  const out: Date[] = [];
  for (let d = ms; !isAfter(d, me); d = addDays(d, 1)) {
    if (isDisabledDay(d)) continue;
    out.push(d);
  }
  return out;
}

export function getWeeksInCurrentMonth(): number {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1–12

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // Convert Sunday(0) → 7 (ISO style)
  const startDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const endDay = lastDay.getDay() === 0 ? 7 : lastDay.getDay();

  const daysInMonth = lastDay.getDate();

  return Math.ceil((daysInMonth + startDay - endDay) / 7);
}

export function getCurrentDateInfo() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); 
  const day = now.getDate();

  return {
    year,
    month, 
    day,
  };
}


