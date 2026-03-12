import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { integrationApi } from "../api/integrationApi";
import { userApi } from "../api/userApi";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../i18n/LanguageProvider";
import type { IntegrationConnection } from "../types/integration";
import type { UserProfile } from "../types/user";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    setError("");
    setIsLoading(true);
    try {
      const [profileResponse, integrationsResponse] = await Promise.all([
        userApi.me(),
        integrationApi.list()
      ]);
      setProfile(profileResponse);
      setIntegrations(integrationsResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("settings_title"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page">
      <h1 className="page__title">{t("settings_title")}</h1>
      {error ? <p className="form-message form-message--error">{error}</p> : null}

      <section className="section">
        <h2 className="section__title">{t("settings_profile_title")}</h2>
        {profile ? (
          <div className="details-grid">
            <p><strong>{t("settings_profile_id")}:</strong> {profile.id}</p>
            <p><strong>{t("settings_profile_email")}:</strong> {profile.email}</p>
            <p><strong>{t("settings_profile_timezone")}:</strong> {profile.timezone}</p>
            <p><strong>{t("settings_session_created")}:</strong> {user?.createdAt ?? t("common_none")}</p>
          </div>
        ) : <p>{isLoading ? t("common_loading") : t("settings_profile_missing")}</p>}
        <button type="button" className="text-action text-action--center" onClick={() => void loadSettings()}>
          {t("settings_refresh")}
        </button>
      </section>

      <section className="section">
        <h2 className="section__title">{t("settings_integrations_title")}</h2>
        {integrations.length ? (
          <div className="stack-list">
            {integrations.map((integration) => (
              <div key={integration.id} className="card-row">
                <strong>{integration.provider}</strong>
                <span>{integration.status}</span>
              </div>
            ))}
          </div>
        ) : <p>{isLoading ? t("common_loading") : t("settings_integrations_empty")}</p>}
      </section>

      <section className="section">
        <h2 className="section__title">{t("settings_language")}</h2>
        <div className="pill-row">
          <button type="button" className={`pill-button${language === "EN" ? " pill-button--active" : ""}`} onClick={() => setLanguage("EN")}>
            {t("labels_english")}
          </button>
          <button type="button" className={`pill-button${language === "RU" ? " pill-button--active" : ""}`} onClick={() => setLanguage("RU")}>
            {t("labels_russian")}
          </button>
        </div>
        <p className="muted">{t("settings_selected")}: {language}</p>
      </section>
      <button type="button" className="text-action text-action--center" onClick={handleLogout}>
        {t("settings_logout")}
      </button>
    </div>
  );
};

export default SettingsPage;
