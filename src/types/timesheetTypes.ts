export type DayCode = "8" | "4" | "12" | "L" | "";
export type WeekRow = { weekStart: Date; weekEnd: Date; days: Date[] };

export type MockApiResponse = {
  timesheet: Record<string, number>;
  leaves: { date: string }[];
  holiday: { date: string; name: string }[]; 
};

export type ApiPayload = {
  timesheet: Record<string, number>;
  leaves: { date: string }[];
};

export type SubmitPayload = {
  employeeId: string;
  leaveForecast: { date: string }[];
  timesheet: { date: string; hours: number }[];
};
