import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { consentApi, type ImportConsentStatus } from "../api/consentApi";
import { ApiError } from "../api/httpClient";
import { importApi } from "../api/importApi";
import type { ImportHistoryItem, ImportResult, MailMessageRequest } from "../types/import";

const IMPORT_PROVIDER = "GMAIL";

type ImportConsentErrorPayload = {
  code?: string;
  provider?: string;
  message?: string;
};

const getImportConsentError = (error: ApiError): ImportConsentErrorPayload | null => {
  const details = error.details as ImportConsentErrorPayload | undefined;
  if (error.status === 403 && details?.code === "IMPORT_CONSENT_REQUIRED") {
    return details;
  }

  return null;
};

const ImportScreen = () => {
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [details, setDetails] = useState<ImportResult | null>(null);
  const [consentStatus, setConsentStatus] = useState<ImportConsentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsentLoading, setIsConsentLoading] = useState(true);
  const [isConsentUpdating, setIsConsentUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("Subscription renewal");
  const [fromEmail, setFromEmail] = useState("billing@example.com");
  const [pendingRetryPayload, setPendingRetryPayload] = useState<MailMessageRequest | null>(null);

  const hasGrantedConsent = consentStatus?.status === "GRANTED";
  const canSubmit = useMemo(
    () => Boolean(message.trim() && subject.trim() && fromEmail.trim() && hasGrantedConsent),
    [fromEmail, hasGrantedConsent, message, subject]
  );

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await importApi.getHistory();
      setHistory(response);
    } catch (historyError) {
      setError(
        historyError instanceof ApiError && historyError.status === 400
          ? "Invalid import history request."
          : historyError instanceof Error
            ? historyError.message
            : "Failed to load import history."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadConsentStatus = useCallback(async () => {
    try {
      setIsConsentLoading(true);
      const status = await consentApi.getImportConsentStatus(IMPORT_PROVIDER);
      setConsentStatus(status);
    } catch (consentError) {
      setError(consentError instanceof Error ? consentError.message : "Failed to load import consent status.");
    } finally {
      setIsConsentLoading(false);
    }
  }, []);

  const runImport = useCallback(
    async (payload: MailMessageRequest) => {
      const result = await importApi.start({
        provider: IMPORT_PROVIDER,
        messages: [payload]
      });
      setDetails(result);
      setPendingRetryPayload(null);
      await loadHistory();
    },
    [loadHistory]
  );

  const onGrantConsent = useCallback(async () => {
    try {
      setError(null);
      setIsConsentUpdating(true);
      const status = await consentApi.grantImportConsent(IMPORT_PROVIDER);
      setConsentStatus(status);
    } catch (grantError) {
      setError(grantError instanceof Error ? grantError.message : "Failed to grant import consent.");
    } finally {
      setIsConsentUpdating(false);
    }
  }, []);

  const onRevokeConsent = useCallback(async () => {
    try {
      setError(null);
      setIsConsentUpdating(true);
      const status = await consentApi.revokeImportConsent(IMPORT_PROVIDER);
      setConsentStatus(status);
      setPendingRetryPayload(null);
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Failed to revoke import consent.");
    } finally {
      setIsConsentUpdating(false);
    }
  }, []);

  const handleImportError = useCallback((startError: unknown, payload: MailMessageRequest) => {
    if (startError instanceof ApiError) {
      const consentError = getImportConsentError(startError);
      if (consentError) {
        setPendingRetryPayload(payload);
        setConsentStatus((prev) => ({
          provider: IMPORT_PROVIDER,
          status: "NOT_GRANTED",
          scope: prev?.scope,
          grantedAt: prev?.grantedAt ?? null,
          revokedAt: prev?.revokedAt ?? null,
          integrationStatus: prev?.integrationStatus
        }));
        setError(consentError.message ?? "Import consent is required before import for provider GMAIL.");
        return;
      }
    }

    setError(
      startError instanceof ApiError && startError.status === 400
        ? "Import payload validation failed."
        : startError instanceof Error
          ? startError.message
          : "Failed to start import."
    );
  }, []);

  useEffect(() => {
    void loadHistory();
    void loadConsentStatus();
  }, [loadConsentStatus, loadHistory]);

  const onStartImport = async () => {
    if (!hasGrantedConsent) {
      setError("Import consent is required before import. Tap \"Grant consent\" to continue.");
      return;
    }

    const payload: MailMessageRequest = {
      externalId: `manual-${Date.now()}`,
      from: fromEmail.trim(),
      subject: subject.trim(),
      body: message.trim(),
      receivedAt: new Date().toISOString()
    };

    try {
      setError(null);
      setIsSubmitting(true);
      await runImport(payload);
    } catch (startError) {
      handleImportError(startError, payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGrantAndRetry = async () => {
    if (!pendingRetryPayload) {
      await onGrantConsent();
      return;
    }

    try {
      setError(null);
      setIsConsentUpdating(true);
      setIsSubmitting(true);
      const status = await consentApi.grantImportConsent(IMPORT_PROVIDER);
      setConsentStatus(status);
      await runImport(pendingRetryPayload);
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Failed to grant consent and retry import.");
    } finally {
      setIsConsentUpdating(false);
      setIsSubmitting(false);
    }
  };

  const onLoadDetails = async (id: number) => {
    try {
      setError(null);
      const result = await importApi.getById(id);
      setDetails(result);
    } catch (detailsError) {
      setError(
        detailsError instanceof ApiError && detailsError.status === 400
          ? "Invalid import id."
          : detailsError instanceof Error
            ? detailsError.message
            : "Failed to load import details."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Import</Text>
      {isLoading ? <Text>Loading history...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Import consent</Text>
        {isConsentLoading ? <Text>Loading consent status...</Text> : <Text>Status: {consentStatus?.status ?? "UNKNOWN"}</Text>}
        {hasGrantedConsent ? (
          <Button
            disabled={isConsentUpdating}
            title={isConsentUpdating ? "Revoking..." : "Revoke consent"}
            onPress={() => void onRevokeConsent()}
          />
        ) : (
          <Button
            disabled={isConsentLoading || isConsentUpdating}
            title={isConsentUpdating ? "Granting..." : "Grant consent"}
            onPress={() => void onGrantConsent()}
          />
        )}
        {!hasGrantedConsent ? <Text>Grant consent to enable import start.</Text> : null}
        {pendingRetryPayload ? (
          <Button
            disabled={isConsentLoading || isConsentUpdating || isSubmitting}
            title={isConsentUpdating || isSubmitting ? "Granting and retrying..." : "Grant consent and retry"}
            onPress={() => void onGrantAndRetry()}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start import (MVP)</Text>
        <TextInput style={styles.input} placeholder="From" value={fromEmail} onChangeText={setFromEmail} />
        <TextInput style={styles.input} placeholder="Subject" value={subject} onChangeText={setSubject} />
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Email body"
          value={message}
          onChangeText={setMessage}
        />
        <Button
          disabled={!canSubmit || isSubmitting || isConsentLoading || !hasGrantedConsent}
          title={isSubmitting ? "Starting..." : "Start import"}
          onPress={() => void onStartImport()}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        {history.length === 0 ? <Text>No import jobs.</Text> : null}
        {history.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text>#{item.id}</Text>
            <Text>
              {item.provider} | {item.status}
            </Text>
            <Button title="Details" onPress={() => void onLoadDetails(item.id)} />
          </View>
        ))}
      </View>

      {details ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details #{details.jobId}</Text>
          <Text>Status: {details.status}</Text>
          <Text>
            Processed: {details.processed}, Created: {details.created}, Skipped: {details.skipped}, Errors: {details.errors}
          </Text>
          {details.errorItems.length > 0 ? <Text style={styles.sectionTitle}>Errors</Text> : null}
          {details.errorItems.map((item) => (
            <Text key={`${item.externalId}-${item.reason}`}>
              {item.externalId}: {item.reason}
            </Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  section: {
    gap: 8
  },
  sectionTitle: {
    fontWeight: "700"
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top"
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    gap: 6
  },
  error: {
    color: "#b91c1c"
  }
});

export default ImportScreen;
