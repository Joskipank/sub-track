import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "../api/httpClient";
import { importApi } from "../api/importApi";
import type { ImportHistoryItem, ImportResult, MailMessageRequest } from "../types/import";

const ImportScreen = () => {
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [details, setDetails] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("Subscription renewal");
  const [fromEmail, setFromEmail] = useState("billing@example.com");

  const canSubmit = useMemo(() => Boolean(message.trim() && subject.trim() && fromEmail.trim()), [message, subject, fromEmail]);

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

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const onStartImport = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      const payload: MailMessageRequest = {
        externalId: `manual-${Date.now()}`,
        from: fromEmail.trim(),
        subject: subject.trim(),
        body: message.trim(),
        receivedAt: new Date().toISOString()
      };
      const result = await importApi.start({
        provider: "GMAIL",
        messages: [payload]
      });
      setDetails(result);
      await loadHistory();
    } catch (startError) {
      setError(
        startError instanceof ApiError && startError.status === 400
          ? "Import payload validation failed."
          : startError instanceof Error
            ? startError.message
            : "Failed to start import."
      );
    } finally {
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
          disabled={!canSubmit || isSubmitting}
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
