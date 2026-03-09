import { api } from "../config/axiosInstance";

export interface EmployeeReportPayload {
  sowId: string;
  month: string;
}

export const employeeReportApi = async (
  payload: EmployeeReportPayload
): Promise<void> => {
  const { sowId, month } = payload;

  await api.get(`/public/export/employee-reports?sowId=${sowId}&month=${month}`, {
    responseType: "blob",
  });
};