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
        <Link to="/" className="auth-card__brand">
          SubTrack
        </Link>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
