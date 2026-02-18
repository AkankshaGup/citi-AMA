import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./Layout";
import Login from "../component/Login";
import ManagerDashboard from "../component/ManagerDashboard";
import AddTimeSheet from "../component/AddTimeSheet";
import LeaveForecastPage from "../component/LeaveForecastPage";
import Dashboard from "../component/Dashboard";
import { auth } from "../auth/auth";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  auth.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  auth.isAuthenticated() ? <Navigate to="/" replace /> : <>{children}</>;

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
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

      // COMMON ROUTES
      {
        path: "dashboard",
        element: <ManagerDashboard />,
      },
      // {
      //   path: "add-timesheet",
      //   element: <AddTimeSheet />,
      // },
      // {
      //   path: "leave-forecast-page",
      //   element: <LeaveForecastPage />,
      // },
    ],
  },
]);
