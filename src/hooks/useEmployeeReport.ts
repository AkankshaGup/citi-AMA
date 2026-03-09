import { useMutation } from "@tanstack/react-query";
import { employeeReportApi } from "../api/employeeReportApi";
import type { EmployeeReportPayload } from "../api/employeeReportApi";

export const useEmployeeReport = () => {
  return useMutation({
    mutationFn: (payload: EmployeeReportPayload) =>
      employeeReportApi(payload),
  });
};