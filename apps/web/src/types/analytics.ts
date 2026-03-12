export type AnalyticsPeriod = "month" | "year";

export interface AnalyticsSummary {
  period: string;
  from: string;
  to: string;
  totalAmount: number;
  activeSubscriptions: number;
  currency: string;
}

export interface AnalyticsCategoryItem {
  category: string;
  amount: number;
  sharePercent: number;
  subscriptionsCount: number;
}

export interface AnalyticsByCategory {
  period: string;
  from: string;
  to: string;
  totalAmount: number;
  currency: string;
  items: AnalyticsCategoryItem[];
}

export interface AnalyticsForecast {
  monthForecast: number;
  yearForecast: number;
  currency: string;
}

export interface AnalyticsUsageItem {
  subscriptionId: number;
  serviceName: string;
  category: string | null;
  signalsCount: number;
  lastSignalAt: string | null;
}

export interface AnalyticsUsage {
  period: string;
  from: string;
  to: string;
  totalSignals: number;
  activeSubscriptions: number;
  subscriptionsWithSignals: number;
  items: AnalyticsUsageItem[];
}

export interface DashboardResponse {
  summary: AnalyticsSummary;
  forecast: AnalyticsForecast;
  byCategory: AnalyticsByCategory;
  upcoming: import("./subscription").UpcomingSubscription[];
  notifications: import("./notification").Notification[];
}
