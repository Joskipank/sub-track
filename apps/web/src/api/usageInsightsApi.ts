import type { AnalyticsPeriod } from "../types/analytics";
import type { UsageInsights, UsageSubscriptionItem } from "../types/usageInsights";
import { analyticsApi } from "./analyticsApi";

const toNumber = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0);

const normalizeSubscription = (item: any, index: number): UsageSubscriptionItem => ({
  id: toNumber(item?.id ?? item?.subscriptionId ?? index + 1),
  serviceName: String(item?.serviceName ?? item?.name ?? `Subscription ${index + 1}`),
  signalsCount: toNumber(item?.signalsCount ?? item?.signalCount ?? item?.signals_count),
  lastSignalAt:
    typeof item?.lastSignalAt === "string"
      ? item.lastSignalAt
      : typeof item?.last_signal_at === "string"
        ? item.last_signal_at
        : null
});

export const usageInsightsApi = {
  get: async (period: AnalyticsPeriod, subscriptionId?: number | null) => {
    const data = await analyticsApi.usage(period, subscriptionId);

    const normalized: UsageInsights = {
      metrics: {
        totalSignals: toNumber(data.totalSignals),
        activeSubscriptions: toNumber(data.activeSubscriptions),
        averageSignalsPerSubscription:
          data.subscriptionsWithSignals > 0
            ? data.totalSignals / data.subscriptionsWithSignals
            : 0
      },
      subscriptions: data.items.map(normalizeSubscription)
    };

    return normalized;
  }
};
