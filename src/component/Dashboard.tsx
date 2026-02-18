
import { auth } from "../auth/auth";
import LeaveForecastPage from "./LeaveForecastPage";
import ManagerDashboard from "./ManagerDashboard";
import UserDashboard from "./UserDashboard";

export default function Dashboard() {
    
const user = auth.getUser();
const isAdmin = user?.role === "ROLE_ADMIN";
  return (<>
    {isAdmin ? (
      <ManagerDashboard />
    ) : (
      <UserDashboard />
    )}
    </>
  );
}