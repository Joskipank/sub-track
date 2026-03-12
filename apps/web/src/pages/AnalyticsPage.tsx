import { useEffect, useState, type FormEvent } from "react";
import { analyticsApi } from "../api/analyticsApi";
import { subscriptionApi } from "../api/subscriptionApi";
import { usageSignalApi } from "../api/usageSignalApi";
import { useLanguage } from "../i18n/LanguageProvider";
import type {
  AnalyticsByCategory,
  AnalyticsForecast,
  AnalyticsPeriod,
  AnalyticsSummary,
  AnalyticsUsage
} from "../types/analytics";
import type { Subscription } from "../types/subscription";
import type { UsageSignalPayload } from "../types/usageSignal";
import { formatCurrency } from "../utils/formatCurrency";

const PERIODS: AnalyticsPeriod[] = ["month", "year"];
const CHART_TYPES = ["bar", "line"] as const;
type ChartType = (typeof CHART_TYPES)[number];
const ALL_SUBSCRIPTIONS = "ALL";

const AnalyticsPage = () => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byCategory, setByCategory] = useState<AnalyticsByCategory | null>(null);
  const [forecast, setForecast] = useState<AnalyticsForecast | null>(null);
  const [usage, setUsage] = useState<AnalyticsUsage | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [signals, setSignals] = useState<Array<{ id: number; subscriptionId: number; signalType: string; value: string; createdAt: string }>>([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>(ALL_SUBSCRIPTIONS);
  const [signalForm, setSignalForm] = useState({ subscriptionId: "", signalType: "APP_OPEN", value: "manual" });
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSignalSaving, setIsSignalSaving] = useState(false);

  const currentSubscriptionId =
    selectedSubscriptionId === ALL_SUBSCRIPTIONS ? null : Number(selectedSubscriptionId);

  const loadPage = async (periodValue: AnalyticsPeriod, subscriptionId: number | null) => {
    const params = subscriptionId ?? undefined;
    const [subscriptionsResponse, summaryResponse, byCategoryResponse, forecastResponse, usageResponse, signalsResponse] =
      await Promise.all([
        subscriptionApi.list(),
        analyticsApi.summary(periodValue),
        analyticsApi.byCategory(periodValue),
        analyticsApi.forecast(),
        analyticsApi.usage(periodValue, params),
        usageSignalApi.list(params)
      ]);

    setSubscriptions(subscriptionsResponse);
    setSummary(summaryResponse);
    setByCategory(byCategoryResponse);
    setForecast(forecastResponse);
    setUsage(usageResponse);
    setSignals(signalsResponse);
    setSignalForm((current) => ({
      ...current,
      subscriptionId: current.subscriptionId || (subscriptionsResponse[0] ? String(subscriptionsResponse[0].id) : "")
    }));
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setError("");
      setIsLoading(true);

      try {
        await loadPage(period, currentSubscriptionId);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnalytics();
  }, [period, selectedSubscriptionId]);

  const averageSignals =
    usage && usage.subscriptionsWithSignals > 0
      ? usage.totalSignals / usage.subscriptionsWithSignals
      : 0;

  const handleSignalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!signalForm.subscriptionId || !signalForm.signalType.trim() || !signalForm.value.trim()) {
      setError(t("analytics_usage_fill_fields"));
      return;
    }

    const payload: UsageSignalPayload = {
      subscriptionId: Number(signalForm.subscriptionId),
      signalType: signalForm.signalType.trim(),
      value: signalForm.value.trim()
    };

    setIsSignalSaving(true);

    try {
      await usageSignalApi.create(payload);
      setSignalForm((current) => ({ ...current, signalType: "APP_OPEN", value: "manual" }));
      await loadPage(period, currentSubscriptionId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save usage signal");
    } finally {
      setIsSignalSaving(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page__title">{t("analytics_title")}</h1>
      <div className="pill-row pill-row--links">
        {PERIODS.map((value) => (
          <button key={value} type="button" className={`link-tab${period === value ? " link-tab--active" : ""}`} onClick={() => setPeriod(value)}>
            {value === "month" ? t("dashboard_month") : t("dashboard_year")}
          </button>
        ))}
      </div>

      {error ? <p className="form-message form-message--error">{error}</p> : null}

      <section className="section">
        <h2 className="section__title">{t("analytics_usage_title")}</h2>
        <p className="label">{t("analytics_usage_filter_label")}</p>
        <select className="input" value={selectedSubscriptionId} onChange={(event) => setSelectedSubscriptionId(event.target.value)}>
          <option value={ALL_SUBSCRIPTIONS}>{t("analytics_usage_filter_all")}</option>
          {subscriptions.map((subscription) => (
            <option key={subscription.id} value={String(subscription.id)}>
              {subscription.serviceName}
            </option>
          ))}
        </select>

        <div className="usage-metrics">
          <div className="card-row"><strong>{usage?.totalSignals ?? (isLoading ? "..." : 0)}</strong><span>{t("analytics_usage_metric_total_signals")}</span></div>
          <div className="card-row"><strong>{usage?.activeSubscriptions ?? (isLoading ? "..." : 0)}</strong><span>{t("analytics_usage_metric_active_subscriptions")}</span></div>
          <div className="card-row"><strong>{usage?.subscriptionsWithSignals ?? (isLoading ? "..." : 0)}</strong><span>{t("analytics_usage_metric_with_signals")}</span></div>
          <div className="card-row"><strong>{usage ? averageSignals.toFixed(1) : isLoading ? "..." : "0.0"}</strong><span>{t("analytics_usage_metric_avg_signals")}</span></div>
        </div>

        <div className="pill-row">
          {CHART_TYPES.map((type) => (
            <button key={type} type="button" className={`pill-button${chartType === type ? " pill-button--active" : ""}`} onClick={() => setChartType(type)}>
              {type === "bar" ? t("analytics_usage_chart_bar") : t("analytics_usage_chart_line")}
            </button>
          ))}
        </div>

        {usage?.items.length ? (
          chartType === "bar" ? (
            <div className="usage-chart usage-chart--bar">
              {usage.items.map((item) => (
                <div key={item.subscriptionId} className="usage-bar-row">
                  <span className="usage-bar-row__label">{item.serviceName}</span>
                  <div className="usage-bar-row__track">
                    <div
                      className="usage-bar-row__fill"
                      style={{
                        width: `${Math.max(8, (item.signalsCount / Math.max(...usage.items.map((entry) => entry.signalsCount), 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="usage-bar-row__value">{item.signalsCount}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="usage-chart usage-chart--line">
              {usage.items.map((item) => (
                <div key={item.subscriptionId} className="usage-line-row">
                  <span>{item.serviceName}</span>
                  <div className="usage-line-row__dots">
                    <span className="usage-line-row__dot" />
                    <span>{item.signalsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : <p>{isLoading ? t("common_loading") : t("analytics_usage_empty")}</p>}

        {usage?.items.length ? (
          <div className="stack-list">
            {usage.items.map((item) => (
              <div key={`usage-${item.subscriptionId}`} className="card-row">
                <strong>{item.serviceName}</strong>
                <span>{t("analytics_usage_list_signals")}: {item.signalsCount} · {t("analytics_usage_list_last_signal")}: {item.lastSignalAt ?? t("common_none")}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="section">
        <h2 className="section__title">{t("analytics_usage_create_title")}</h2>
        <form onSubmit={handleSignalSubmit}>
          <p className="label">{t("analytics_usage_subscription")}</p>
          <select className="input" value={signalForm.subscriptionId} onChange={(event) => setSignalForm((current) => ({ ...current, subscriptionId: event.target.value }))}>
            <option value="">{t("analytics_usage_select_subscription")}</option>
            {subscriptions.map((subscription) => (
              <option key={subscription.id} value={String(subscription.id)}>
                {subscription.serviceName}
              </option>
            ))}
          </select>
          <input className="input" placeholder={t("analytics_usage_signal_type")} value={signalForm.signalType} onChange={(event) => setSignalForm((current) => ({ ...current, signalType: event.target.value }))} />
          <input className="input" placeholder={t("analytics_usage_signal_value")} value={signalForm.value} onChange={(event) => setSignalForm((current) => ({ ...current, value: event.target.value }))} />
          <button type="submit" className="button" disabled={isSignalSaving || !subscriptions.length}>
            {isSignalSaving ? t("analytics_usage_create_loading") : t("analytics_usage_create_button")}
          </button>
        </form>
      </section>

      <section className="section">
        <h2 className="section__title">{t("analytics_usage_raw_title")}</h2>
        {signals.length ? (
          <div className="stack-list">
            {signals.map((signal) => {
              const subscription = subscriptions.find((item) => item.id === signal.subscriptionId);
              return (
                <div key={signal.id} className="card-row">
                  <strong>{subscription?.serviceName ?? `#${signal.subscriptionId}`} · {signal.signalType}</strong>
                  <span>{signal.value} · {signal.createdAt}</span>
                </div>
              );
            })}
          </div>
        ) : <p>{isLoading ? t("common_loading") : t("analytics_usage_raw_empty")}</p>}
      </section>

      <section className="section">
        <h2 className="section__title">{t("analytics_summary")} ({period === "month" ? t("dashboard_month") : t("dashboard_year")})</h2>
        <p>{t("dashboard_total")}: {summary ? formatCurrency(summary.totalAmount, summary.currency) : isLoading ? "..." : "0"}</p>
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
                <span>{formatCurrency(item.amount, byCategory.currency)} · {item.sharePercent}% · {item.subscriptionsCount}</span>
              </div>
            ))}
          </div>
        ) : <p>{isLoading ? t("common_loading") : t("analytics_empty_categories")}</p>}
      </section>

      <section className="section">
        <h2 className="section__title">{t("analytics_forecast")}</h2>
        <p>{t("dashboard_month")}: {forecast ? formatCurrency(forecast.monthForecast, forecast.currency) : isLoading ? "..." : "0"}</p>
        <p>{t("dashboard_year")}: {forecast ? formatCurrency(forecast.yearForecast, forecast.currency) : isLoading ? "..." : "0"}</p>
      </section>
    </div>
  );
};

export default AnalyticsPage;
