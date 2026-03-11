export interface ImportConsentStatus {
  provider: string;
  status: string;
  scope: string | null;
  grantedAt: string | null;
  revokedAt: string | null;
  integrationStatus: string | null;
}

export interface ImportHistoryItem {
  id: number;
  provider: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
}

export interface ImportErrorItem {
  code: string;
  message: string;
  externalId: string | null;
}

export interface ImportResult {
  jobId: number;
  provider: string;
  status: string;
  processed: number;
  created: number;
  skipped: number;
  errors: number;
  startedAt: string;
  finishedAt: string | null;
  errorItems: ImportErrorItem[];
}

export interface MailMessageRequest {
  externalId: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
}
