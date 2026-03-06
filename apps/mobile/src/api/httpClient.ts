import axios from "axios";

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api"
});
