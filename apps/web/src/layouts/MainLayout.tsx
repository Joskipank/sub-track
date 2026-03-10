import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Дашборд", icon: "▾" },
  { to: "/subscriptions", label: "Подписки", icon: "▾" },
  { to: "/upcoming", label: "Ближайшие", icon: "▾" },
  { to: "/reminders", label: "Напоминания", icon: "▾" },
  { to: "/analytics", label: "Аналитика", icon: "▾" },
  { to: "/import", label: "Import", icon: "▾" },
  { to: "/settings", label: "Настройки", icon: "▾" }
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Дашборд",
  "/subscriptions": "Подписки",
  "/upcoming": "Ближайшие",
  "/reminders": "Напоминания",
  "/analytics": "Аналитика",
  "/import": "Import",
  "/settings": "Настройки"
};

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__back">◂ Камера</div>
        <div className="topbar__title">{PAGE_TITLES[location.pathname] ?? "SubTrack"}</div>
      </header>
      <main className="page-frame">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Основная навигация">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`
            }
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;
