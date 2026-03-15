import { httpClient } from "./httpClient";
import type { IntegrationConnection } from "../types/integration";
import type { OAuthStartResponse } from "../types/import";

export const integrationApi = {
  getAll: async (): Promise<IntegrationConnection[]> => {
    const response = await httpClient.get<IntegrationConnection[]>("/api/v1/integrations");
    return response.data;
  },
  getStatus: async (provider: string): Promise<IntegrationConnection> => {
    const response = await httpClient.get<IntegrationConnection>(`/api/v1/integrations/${provider}`);
    return response.data;
  },
  startOAuth: async (provider: string): Promise<OAuthStartResponse> => {
    const response = await httpClient.post<OAuthStartResponse>(`/api/v1/integrations/${provider}/oauth/start`);
    return response.data;
  },
  disconnect: async (provider: string): Promise<IntegrationConnection> => {
    const response = await httpClient.post<IntegrationConnection>(`/api/v1/integrations/${provider}/disconnect`);
    return response.data;
  }
};
