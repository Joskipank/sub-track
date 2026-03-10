import axios from "axios";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"
});

interface SessionData {
  token?: string;
}

interface RequestConfig {
  headers?: Record<string, string>;
  [key: string]: unknown;
}

httpClient.interceptors.request.use((config: RequestConfig): RequestConfig => {
  if (typeof window === "undefined") {
    return config;
  }

  const rawSession: string | null = window.localStorage.getItem("subtrack.auth");
  if (!rawSession) {
    return config;
  }

  try {
    const session = JSON.parse(rawSession) as SessionData;
    if (session.token) {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${session.token}`
      };
    }
  } catch {
    window.localStorage.removeItem("subtrack.auth");
  }

  return config;
});
