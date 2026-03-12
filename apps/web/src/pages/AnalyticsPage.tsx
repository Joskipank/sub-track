import { useEffect, useState } from "react";
import { analyticsApi } from "../api/analyticsApi";
import { useLanguage } from "../i18n/LanguageProvider";
import type {
  AnalyticsByCategory,
  AnalyticsForecast,
  AnalyticsPeriod,
  AnalyticsSummary
} from "../types/analytics";
import { formatCurrency } from "../utils/formatCurrency";

const PERIODS: AnalyticsPeriod[] = ["month", "year"];

const AnalyticsPage = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byCategory, setByCategory] = useState<AnalyticsByCategory | null>(null);
  const [forecast, setForecast] = useState<AnalyticsForecast | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setError("");
      setIsLoading(true);

      try {
        const [summaryResponse, byCategoryResponse, forecastResponse] = await Promise.all([
          analyticsApi.summary(period),
          analyticsApi.byCategory(period),
          analyticsApi.forecast()
        ]);

        setSummary(summaryResponse);
        setByCategory(byCategoryResponse);
        setForecast(forecastResponse);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnalytics();
  }, [period]);

  return (
    <div className="page">
      <h1 className="page__title">{t("analytics_title")}</h1>
      <div className="pill-row pill-row--links">
        {PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            className={`link-tab${period === value ? " link-tab--active" : ""}`}
            onClick={() => setPeriod(value)}
          >
            {value === "month" ? t("dashboard_month") : t("dashboard_year")}
          </button>
        ))}
      </div>

      {error ? <p className="form-message form-message--error">{error}</p> : null}

      <section className="section">
        <h2 className="section__title">
          {t("analytics_summary")} ({period === "month" ? t("dashboard_month") : t("dashboard_year")})
        </h2>
        <p>
          {t("dashboard_total")}:{" "}
          {summary ? formatCurrency(summary.totalAmount, summary.currency) : isLoading ? "..." : "0"}
        </p>
        <p>{t("dashboard_active")}: {summary?.activeSubscriptions ?? (isLoading ? "..." : 0)}</p>
        <p>{t("dashboard_period")}: {summary ? `${summary.from} - ${summary.to}` : isLoading ? t("common_loading") : "-"}</p>
      </section>

      <section className="section">
        <h2 className="section__title">{t("analytics_by_category")}</h2>
        {byCategory?.items.length ? (
          <div className="stack-list">
            {byCategory.items.map((item) => (
              <div key={item.category} className="card-row">
                <strong>{item.category}</strong>
                <span>
                  {formatCurrency(item.amount, byCategory.currency)} · {item.sharePercent}% ·{" "}
                  {item.subscriptionsCount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>{isLoading ? t("common_loading") : t("analytics_empty_categories")}</p>
        )}
      </section>

      <section className="section">
        <h2 className="section__title">{t("analytics_forecast")}</h2>
        <p>
          {t("dashboard_month")}:{" "}
          {forecast ? formatCurrency(forecast.monthForecast, forecast.currency) : isLoading ? "..." : "0"}
        </p>
        <p>
          {t("dashboard_year")}:{" "}
          {forecast ? formatCurrency(forecast.yearForecast, forecast.currency) : isLoading ? "..." : "0"}
        </p>
      </section>
    </div>
  );
};

export default AnalyticsPage;
