import { httpClient } from "./httpClient";
import type { AuthCredentials, AuthResponse, RegisterPayload } from "../types/auth";

type RawAuthResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  jwtToken?: string;
};

const extractToken = (data: RawAuthResponse): string => {
  const token = data.token ?? data.accessToken ?? data.jwt ?? data.jwtToken;

  if (!token) {
    throw new Error("Auth token is missing in API response.");
  }

  return token;
};

export const authApi = {
  login: async (payload: AuthCredentials): Promise<AuthResponse> => {
    const response = await httpClient.post<RawAuthResponse>("/api/v1/auth/login", payload);
    return { token: extractToken(response.data) };
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await httpClient.post<RawAuthResponse>("/api/v1/auth/register", {
      email: payload.email,
      password: payload.password
    });
    return { token: extractToken(response.data) };
  }
};
