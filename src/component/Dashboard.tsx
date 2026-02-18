
import { auth } from "../auth/auth";
import LeaveForecastPage from "./LeaveForecastPage";
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard() {
    
const user = auth.getUser();
const isAdmin = user?.role === "ROLE_ADMIN";
console.log("User Role in Route Config:", user?.role);// Replace with actual logic to determine if the user is a manager
  return (<>
    {isAdmin ? (
      <ManagerDashboard />
    ) : (
      <LeaveForecastPage />
    )}
    </>
  );
}