import axios from "axios";

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api"
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    httpClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete httpClient.defaults.headers.common.Authorization;
};
