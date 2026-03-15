import axios from "axios";
import type { ApiError } from "../api/httpClient";
import type { ImportItemResult } from "../types/import";

export const formatImportDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

export const getImportErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string; errors?: Record<string, string> }>(error)) {
    const fieldError = error.response?.data?.errors
      ? Object.values(error.response.data.errors)[0]
      : null;

    return fieldError ?? error.response?.data?.message ?? "Request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
};

export const getStructuredApiError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return null;
  }

  const apiError = error as ApiError;
  if (!apiError.status || !apiError.details) {
    return null;
  }

  const details = apiError.details as { code?: string; provider?: string; message?: string } | undefined;
  return {
    status: apiError.status,
    code: details?.code ?? null,
    provider: details?.provider ?? null,
    message: details?.message ?? apiError.message
  };
};

export const getImportItemSummary = (item: ImportItemResult) => {
  if (item.serviceName && item.amount != null && item.currency) {
    return `${item.serviceName} | ${item.amount.toFixed(2)} ${item.currency}`;
  }

  if (item.serviceName) {
    return item.serviceName;
  }

  return item.externalId;
};

export const dedupeImportItems = (items: ImportItemResult[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.externalId}:${item.status}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const parseGmailCallbackUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const gmail = parsed.searchParams.get("gmail");
    const reason = parsed.searchParams.get("reason");
    return { gmail, reason };
  } catch {
    return { gmail: null, reason: null };
  }
};
