import type {
  ImportConsentStatus,
  ImportProvider,
  ImportHistoryItem,
  ImportResult,
  MailMessageRequest
} from "../types/import";
import { httpClient } from "./httpClient";

export const importApi = {
  status: async (provider: ImportProvider) => {
    const { data } = await httpClient.get<ImportConsentStatus>(`/consents/imports/${provider}`);
    return data;
  },
  grant: async (provider: ImportProvider) => {
    const { data } = await httpClient.post<ImportConsentStatus>(
      `/consents/imports/${provider}/grant`
    );
    return data;
  },
  revoke: async (provider: ImportProvider) => {
    const { data } = await httpClient.post<ImportConsentStatus>(
      `/consents/imports/${provider}/revoke`
    );
    return data;
  },
  history: async () => {
    const { data } = await httpClient.get<ImportHistoryItem[]>("/imports");
    return data;
  },
  details: async (id: number) => {
    const { data } = await httpClient.get<ImportResult>(`/imports/${id}`);
    return data;
  },
  start: async (provider: ImportProvider, messages: MailMessageRequest[]) => {
    const { data } = await httpClient.post<ImportResult>("/imports/start", {
      provider,
      messages
    });
    return data;
  }
};
