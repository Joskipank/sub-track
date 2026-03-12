import { Link, Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="auth-shell">
      <div className="auth-shell__backdrop" />
      <div className="auth-card">
        <aside className="auth-card__showcase">
          <div>
            <Link to="/" className="auth-card__brand landing-brand" aria-label="SubTrack">
              <span className="landing-brand__text">
                <span className="landing-brand__main">Sub</span>
                <span className="landing-brand__script">Track</span>
              </span>
            </Link>
            <p className="auth-card__kicker">Web workspace</p>
            <h2>Subscriptions, analytics, reminders.</h2>
            <p>One place to manage recurring spending and upcoming charges.</p>
          </div>

          <div className="auth-card__grid">
            <div>
              <strong>Analytics</strong>
              <span>Monthly and yearly spend overview</span>
            </div>
            <div>
              <strong>Import</strong>
              <span>Mail-based subscription detection</span>
            </div>
            <div>
              <strong>Workspace</strong>
              <span>Dashboard, reminders, and settings in one shell</span>
            </div>
          </div>
        </aside>

        <section className="auth-card__panel">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;
