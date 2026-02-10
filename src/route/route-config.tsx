import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./Layout";
import Login from "../component/Login.tsx";
import ManagerDashboard from "../component/ManagerDashboard.tsx";
import { auth } from "../auth/auth";
import AddTimeSheet from "../component/AddTimeSheet.tsx";
import LeaveForecast from "../component/LeaveForecast.tsx";
import LeaveForecastSample from "../component/LeaveForecastSample.tsx";

const ProtectedRoute = ({ children }) => {
  return auth.isAuthenticated()
    ? children
    : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: auth.isAuthenticated()
      ? <Navigate to="/" replace />
      : <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ManagerDashboard />,
      },
      {
        path: "add-timesheet",
        element: <AddTimeSheet />,
      },
      {
        path: "leave-forecast",
        element: <LeaveForecast />,
      },
      {
        path: "leave-forecast-sample",
        element: <LeaveForecastSample />,
      },
    ],
  },
]);
