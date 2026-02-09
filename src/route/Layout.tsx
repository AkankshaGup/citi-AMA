import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../auth/auth";
import "./Layout.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const user = auth.getUser();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <>
      <header className="header">
        <div className="left">
          Welcome, <strong>{user?.name}</strong>
        </div>

        <div className="right" onClick={handleLogout}>
          🚪 Logout
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </>
  );
}
