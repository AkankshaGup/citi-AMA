import type { MockApiResponse } from "../types/timesheetTypes";

export const MOCK_BY_MONTH: Record<string, MockApiResponse> = {
  "2026-03": {
    timesheet: {
      "2-3-2026": 8,
      "3-3-2026": 8,
    },
    leaves: [{ date: "2026-03-13" }],
    holiday: [
      { date: "04-03-2026", name: "Holi" },
      { date: "19-03-2026", name: "Ugadi/Gudi Padwa" },
      { date: "20-03-2026", name: "Ramzan" },
    ],
  },
  "2026-02": {
    timesheet: {
      "3-2-2026": 8,
    },
    leaves: [{ date: "2026-02-16" }],
    holiday: [
    ],
  },
   "2026-01": {
    timesheet: {
      "7-1-2026": 8,
      "8-1-2026": 8,
      "9-1-2026": 8,
    },
    leaves: [{ date: "2026-01-22" }],
    holiday: [
      { date: "26-01-2026", name: "Republic Day" },
    ],
  },
};

// Dummy promise API
export function fetchTimesheetMockByMonth(userId: string, monthKey: string, delayMs = 250): Promise<MockApiResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_BY_MONTH[monthKey] ?? { timesheet: {}, leaves: [], holiday: [] });
    }, delayMs);
  });
}
