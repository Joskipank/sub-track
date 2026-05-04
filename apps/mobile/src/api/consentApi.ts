import { httpClient } from "./httpClient";
import type { ImportConsentStatus } from "../types/import";

export type ImportConsentProvider = "GMAIL";

export const consentApi = {
  getImportConsentStatus: async (provider: ImportConsentProvider): Promise<ImportConsentStatus> => {
    const response = await httpClient.get<ImportConsentStatus>(`/api/v1/consents/imports/${provider}`);
    return response.data;
  },
  grantImportConsent: async (provider: ImportConsentProvider): Promise<ImportConsentStatus> => {
    const response = await httpClient.post<ImportConsentStatus>(`/api/v1/consents/imports/${provider}/grant`);
    return response.data;
  },
  revokeImportConsent: async (provider: ImportConsentProvider): Promise<ImportConsentStatus> => {
    const response = await httpClient.post<ImportConsentStatus>(`/api/v1/consents/imports/${provider}/revoke`);
    return response.data;
  }
};
