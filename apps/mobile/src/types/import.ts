export type ImportProvider = "GMAIL";
export type ImportStatus = "IN_PROGRESS" | "COMPLETED" | "COMPLETED_WITH_ERRORS" | "FAILED";

export interface OAuthStartResponse {
  provider: string;
  authorizationUrl: string;
}

export interface ImportConsentStatus {
  provider: string;
  status: string;
  scope: string | null;
  grantedAt: string | null;
  revokedAt: string | null;
  integrationStatus: string | null;
}

export interface MailMessageRequest {
  externalId: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
}

export interface ImportStartRequest {
  provider: ImportProvider;
  messages: MailMessageRequest[];
}

export interface ImportErrorItem {
  externalId: string | null;
  reason: string;
}

export interface ImportItemResult {
  externalId: string;
  status: string;
  reason: string | null;
  sourceProvider: string | null;
  serviceName: string | null;
  amount: number | null;
  currency: string | null;
  billingPeriod: string | null;
  nextBillingDate: string | null;
  category: string | null;
  receivedAt: string | null;
}

export interface ImportResult {
  jobId: number;
  provider: string;
  status: string;
  processed: number;
  created: number;
  skipped: number;
  errors: number;
  startedAt?: string | null;
  finishedAt?: string | null;
  errorItems: ImportErrorItem[];
  items: ImportItemResult[];
}

export interface ImportHistoryItem {
  id: number;
  provider: string;
  status: string;
  startedAt?: string | null;
  finishedAt?: string | null;
}
