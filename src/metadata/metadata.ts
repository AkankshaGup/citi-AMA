export const loginRes = {
    "userId": "e1",
    "name": "Alice Admin",
    "email": "alice.admin@example.com",
    "role": "ROLE_User",
    "message": "Login successful"

} 

export const resourceTimesheetData = {
  "content": [
    {
      "employeeId": "e1",
      "name": "Alice Admin",
      "email": "alice.admin@example.com",
      "role": "ADMIN",
      "soeId": "123",
      "location": "Pune",
      "assignmentStartDate": "2025-02-01",
      "timesheets": "[{\"workDate\": \"2026-02-08\", \"hoursLogged\": 8.00}, {\"workDate\": \"2026-02-09\", \"hoursLogged\": 8.00}, {\"workDate\": \"2026-02-10\", \"hoursLogged\": 8.00}, {\"workDate\": \"2026-02-11\", \"hoursLogged\": 4.00}]",
      "leaves": "[{\"comments\": \"Sick leave\", \"startDate\": \"2026-02-09\", \"leaveTypeId\": 1}]",
      "holidays": "[{\"date\": \"2026-02-22\", \"name\": \"Holi\", \"type\": \"1\"}]",
      "totalHours": 28,
      "numberOfLeaves": 1,
      "numberOfHalfDays": 1,
      "numberOfHolidays": 1,
      "weeklyHours": "[{\"hours\": 40.00, \"weekStart\": \"2026-02-01\"}]",
      "ptsSaved": true,
      "cofyUpdate": false,
      "citiTraining": true
    },
    {
      "employeeId": "e2",
      "name": "normalemp1",
      "email": "emp1.admin@example.com",
      "role": "USER",
      "soeId": "12",
      "location": "Pune",
      "assignmentStartDate": "2025-02-01",
      "timesheets": "[{\"workDate\": \"2026-02-08\", \"hoursLogged\": 10.00}]",
      "leaves": "[{\"comments\": \"Sick leave\", \"startDate\": \"2026-02-10\", \"leaveTypeId\": 1}, {\"comments\": \"Sick leave\", \"startDate\": \"2026-02-11\", \"leaveTypeId\": 1}]",
      "holidays": "[{\"date\": \"2026-02-22\", \"name\": \"Holi\", \"type\": \"1\"}]",
      "totalHours": 10,
      "numberOfLeaves": 2,
      "numberOfHalfDays": 0,
      "numberOfHolidays": 1,
      "weeklyHours": "[]",
      "ptsSaved": false,
      "cofyUpdate": true,
      "citiTraining": true
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "empty": true,
      "sorted": false,
      "unsorted": true
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 1,
  "totalElements": 2,
  "last": true,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": true,
    "sorted": false,
    "unsorted": true
  },
  "numberOfElements": 2,
  "first": true,
  "empty": false
}

export const mockTeamData = [
  {
    "sowId": "SOW-1001",
    "sowName": "Digital Payments Platform",
    "managerId": "MANAGER-001"
  },
  {
    "sowId": "SOW-1007",
    "sowName": "MSST-CCB-Informational_Dashboard",
    "managerId": "MANAGER-001"
  },
  {
    "sowId": "SOW-1022",
    "sowName": "Cards & Transaction Platform",
    "managerId": "MANAGER-001"
  }
]

export const mockMonthlyReviewData = {
    "employeeId": "AIPL13991",
    "month": "2026-02-01",
    "whatWentWell": "Completed all tasks on time",
    "improvementsNeeded": "Better documentation",
    "blockersChallenges": "API delays",
    "thingsToTry": "Automate tests",
    "clientAppreciation": "Client praised responsiveness",
    "keyAchievements": "Phase 1 completed successfully"
}