import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-shell">
      <div className="auth-shell__backdrop" />
      <div className="auth-card">
        <div className="auth-card__panel">
          <Link to="/" className="auth-card__brand">
            SubTrack
          </Link>
          <Outlet />
        </div>
        <div className="auth-card__showcase">
          <p className="auth-card__kicker">Desktop Workspace</p>
          <h2>Track recurring costs with a dashboard built for focus.</h2>
          <p>
            A cleaner web workspace for subscriptions, forecasts, reminders, and import flows.
          </p>
          <div className="auth-card__grid">
            <div>
              <strong>Analytics</strong>
              <span>Month and year overview</span>
            </div>
            <div>
              <strong>Import</strong>
              <span>Mail-based subscription detection</span>
            </div>
            <div>
              <strong>Upcoming</strong>
              <span>Charges and reminders in one place</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
