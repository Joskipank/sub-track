export type BillingPeriod = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELED";

export interface Subscription {
  id: number;
  serviceName: string;
  category: string | null;
  amount: number;
  currency: string;
  billingPeriod: BillingPeriod;
  nextBillingDate: string;
  status: SubscriptionStatus;
}

export interface UpcomingSubscription extends Subscription {
  daysUntilBilling: number;
}

export interface SubscriptionPayload {
  serviceName: string;
  categoryId: number | null;
  amount: number;
  currency: string;
  billingPeriod: BillingPeriod;
  nextBillingDate: string;
  status: SubscriptionStatus;
}
