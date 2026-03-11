import type {
  ImportConsentStatus,
  ImportHistoryItem,
  ImportResult,
  MailMessageRequest
} from "../types/import";
import { httpClient } from "./httpClient";

const PROVIDER = "GMAIL";

export const importApi = {
  status: async () => {
    const { data } = await httpClient.get<ImportConsentStatus>(`/consents/imports/${PROVIDER}`);
    return data;
  },
  grant: async () => {
    const { data } = await httpClient.post<ImportConsentStatus>(
      `/consents/imports/${PROVIDER}/grant`
    );
    return data;
  },
  revoke: async () => {
    const { data } = await httpClient.post<ImportConsentStatus>(
      `/consents/imports/${PROVIDER}/revoke`
    );
    return data;
  },
  history: async () => {
    const { data } = await httpClient.get<ImportHistoryItem[]>("/imports");
    return data;
  },
  start: async (messages: MailMessageRequest[]) => {
    const { data } = await httpClient.post<ImportResult>("/imports/start", {
      provider: PROVIDER,
      messages
    });
    return data;
  }
};
