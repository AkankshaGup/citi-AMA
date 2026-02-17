
import LeaveForecastPage from "./LeaveForecastPage";
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard() {
    const isManager = false; // Replace with actual logic to determine if the user is a manager
  return (<>
    {isManager ? (
      <ManagerDashboard />
    ) : (
      <LeaveForecastPage />
    )}
    </>
  );
}