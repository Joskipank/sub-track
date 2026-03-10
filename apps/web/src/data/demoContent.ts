export type PillOption = {
  label: string;
  active?: boolean;
};

export const dashboardData = {
  email: "demo@subtrack.app",
  total: 0,
  activeSubscriptions: 0,
  period: "2026-03-01 - 2026-03-31",
  forecastMonth: 0,
  forecastYear: 0
};

export const subscriptionForm = {
  service: "",
  amount: "9.99",
  currencies: [
    { label: "USD", active: true },
    { label: "RUB" }
  ],
  billingPeriods: [
    { label: "WEEKLY" },
    { label: "MONTHLY", active: true },
    { label: "QUARTERLY" },
    { label: "YEARLY" }
  ],
  categories: [
    { label: "Нет", active: true },
    { label: "Cloud" },
    { label: "Education" },
    { label: "Entertainment" },
    { label: "Finance" }
  ],
  statusFilters: [
    { label: "ALL", active: true },
    { label: "ACTIVE" },
    { label: "PAUSED" },
    { label: "CANCELED" }
  ],
  sortOptions: [
    { label: "Next date", active: true },
    { label: "Amount desc" }
  ]
};

export const analyticsData = {
  tabs: [
    { label: "Месяц", active: true },
    { label: "Год" }
  ],
  total: 0,
  activeSubscriptions: 0,
  range: "2026-03-01 - 2026-03-31",
  forecastMonth: 0,
  forecastYear: 0
};

export const rangeTabs: PillOption[] = [
  { label: "7", active: true },
  { label: "30" },
  { label: "90" }
];

export const importData = {
  status: "NOT_GRANTED",
  from: "billing@example.com",
  subject: "Subscription renewal"
};

export const settingsData = {
  languages: [
    { label: "English" },
    { label: "Русский", active: true }
  ],
  selected: "RU"
};
