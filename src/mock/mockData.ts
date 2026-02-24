import type { MockApiResponse } from "../types/timesheetTypes";

export const HOLIDAYS: Record<string, true> = {}; // you can keep empty if holiday comes from API

export type LeaveForecastGetApiItem = {
    employeeId: string;
    sowId: string;
    timesheets: string;
    leaves: string;
    holidays: string;
};

export type LeaveForecastGetApiResponse = {
    content: LeaveForecastGetApiItem[];
};

const MOCK_GET_BY_MONTH: Record<string, LeaveForecastGetApiResponse> = {
    "2026-02": {
        content: [
            {
                employeeId: "e1",
                sowId: "1",
                timesheets:
                    '[{"workDate":"2026-02-08","hoursLogged":8.00},{"workDate":"2026-02-09","hoursLogged":8.00},{"workDate":"2026-02-10","hoursLogged":8.00},{"workDate":"2026-02-11","hoursLogged":4.00},{"workDate":"2026-02-17","hoursLogged":8.00},{"workDate":"2026-02-14","hoursLogged":8.00}]',
                leaves: '[{"comments":"Sick leave","startDate":"2026-02-09","leaveTypeId":1}]',
                holidays: '[{"date":"2026-02-17","name":"Holi","type":"1"}]',
            },
        ],
    },

    "2026-03": {
        content: [
            {
                employeeId: "e1",
                sowId: "1",
                timesheets:
                    '[{"workDate":"2026-03-02","hoursLogged":8.00},{"workDate":"2026-03-03","hoursLogged":8.00},{"workDate":"2026-03-04","hoursLogged":8.00},{"workDate":"2026-03-06","hoursLogged":4.00}]',
                leaves: '[{"comments":"Planned","startDate":"2026-03-13","leaveTypeId":1},{"comments":"Planned","startDate":"2026-03-18","leaveTypeId":1}]',
                holidays: '[{"date":"2026-03-08","name":"New year","type":"1"},{"date":"2026-03-11","name":"Holi","type":"1"}]',
            },
        ],
    },
};

export function fetchLeaveForecastMock(
    employeeId: string,
    monthKey: string,
    delayMs = 350
): Promise<LeaveForecastGetApiResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // returning month mock; employeeId is ignored here but logged/available for real API later
            resolve(MOCK_GET_BY_MONTH[monthKey] ?? { content: [] });
        }, delayMs);
    });
}


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
