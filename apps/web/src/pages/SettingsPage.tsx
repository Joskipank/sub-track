import { useNavigate } from "react-router-dom";
import { settingsData } from "../data/demoContent";
import { useAuth } from "../hooks/useAuth";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page">
      <h1 className="page__title">Настройки</h1>
      <section className="section">
        <h2 className="section__title">Язык</h2>
        <div className="pill-row">
          {settingsData.languages.map((language) => (
            <button
              key={language.label}
              type="button"
              className={`pill-button${language.active ? " pill-button--active" : ""}`}
            >
              {language.label}
            </button>
          ))}
        </div>
        <p className="muted">Выбрано: {settingsData.selected}</p>
      </section>
      <button type="button" className="text-action text-action--center" onClick={handleLogout}>
        Выйти из аккаунта
      </button>
    </div>
  );
};

export default SettingsPage;
