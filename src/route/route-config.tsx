import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./Layout";
import Login from "../component/Login.tsx";
import ManagerDashboard from "../component/ManagerDashboard.tsx";
import { auth } from "../auth/auth";
import AddTimeSheet from "../component/AddTimeSheet.tsx";
import LeaveForecast from "../component/LeaveForecast.tsx";
import LeaveForecastPage from "../component/LeaveForecastPage.tsx";
import Dashboard from "../component/Dashboard.tsx";

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
        element: <Dashboard />,
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
        path: "leave-forecast-page",
        element: <LeaveForecastPage />,
      },
    ],
  },
]);
