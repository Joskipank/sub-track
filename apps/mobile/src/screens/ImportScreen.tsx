import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppState,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { consentApi } from "../api/consentApi";
import { integrationApi } from "../api/integrationApi";
import { importApi } from "../api/importApi";
import AppButton from "../components/AppButton";
import { useI18n } from "../context/SettingsContext";
import type { AppPalette } from "../theme/theme";
import type {
  ImportConsentStatus,
  ImportHistoryItem,
  ImportItemResult,
  ImportResult,
  MailMessageRequest
} from "../types/import";
import type { IntegrationConnection } from "../types/integration";
import {
  dedupeImportItems,
  formatImportDateTime,
  getImportErrorMessage,
  getImportItemSummary,
  getStructuredApiError,
  parseGmailCallbackUrl
} from "../utils/importMailbox";

const PROVIDER = "GMAIL";

type Notice = {
  kind: "success" | "error";
  text: string;
};

const ImportScreen = () => {
  const { colors } = useI18n();
  const styles = createStyles(colors);
  const [consent, setConsent] = useState<ImportConsentStatus | null>(null);
  const [integration, setIntegration] = useState<IntegrationConnection | null>(null);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"connect" | "sync" | "disconnect" | "details" | null>(null);
  const [manualFrom, setManualFrom] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [manualBody, setManualBody] = useState("");
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  const loadImportPage = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const [consentResponse, integrationResponse, historyResponse] = await Promise.all([
        consentApi.getImportConsentStatus(PROVIDER),
        integrationApi.getStatus(PROVIDER),
        importApi.getHistory()
      ]);

      setConsent(consentResponse);
      setIntegration(integrationResponse);
      setHistory(historyResponse);
    } catch (loadError) {
      setError(getImportErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadImportPage();
  }, [loadImportPage]);

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const { gmail, reason } = parseGmailCallbackUrl(url);
      if (!gmail) {
        return;
      }

      if (gmail === "connected") {
        setNotice({
          kind: "success",
          text: "Gmail is connected. You can start mailbox sync now."
        });
      } else {
        setNotice({
          kind: "error",
          text: reason ? `Gmail connection failed: ${reason}.` : "Gmail connection failed."
        });
      }

      setBusyAction(null);
      void loadImportPage();
    };

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setBusyAction(null);
        void loadImportPage();
      }
    });

    const linkingSubscription = Linking.addEventListener("url", handleUrl);

    return () => {
      appStateSubscription.remove();
      linkingSubscription.remove();
    };
  }, [loadImportPage]);

  const isConnected = integration?.status === "ACTIVE";
  const needsReauth = integration?.status === "REAUTH_REQUIRED";
  const canSync = consent?.status === "GRANTED" && isConnected;
  const canRunManualImport = Boolean(
    manualFrom.trim() && manualSubject.trim() && manualBody.trim() && consent?.status === "GRANTED"
  );

  const connectionHint = useMemo(() => {
    if (needsReauth) {
      return "Google access expired or was revoked. Reconnect Gmail before the next sync.";
    }
    if (isConnected) {
      return "Mailbox sync fetches billing emails from Gmail with read-only access and maps them into SubTrack imports.";
    }
    if (consent?.status === "GRANTED") {
      return "Consent exists, but Gmail is not connected yet. Finish OAuth to enable mailbox sync.";
    }
    return "Connect Gmail to grant explicit consent and import billing emails end-to-end.";
  }, [consent?.status, isConnected, needsReauth]);

  const visibleItems: ImportItemResult[] = useMemo(
    () => dedupeImportItems(result?.items ?? []),
    [result?.items]
  );

  const handleConnect = async () => {
    setError(null);
    setNotice(null);
    setBusyAction("connect");

    try {
      const response = await integrationApi.startOAuth(PROVIDER);
      const canOpen = await Linking.canOpenURL(response.authorizationUrl);

      if (!canOpen) {
        throw new Error("Unable to open Gmail authorization page.");
      }

      await Linking.openURL(response.authorizationUrl);
    } catch (connectError) {
      setError(getImportErrorMessage(connectError));
      setBusyAction(null);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setNotice(null);
    setBusyAction("disconnect");

    try {
      const response = await integrationApi.disconnect(PROVIDER);
      setIntegration(response);
      setConsent((previous) =>
        previous
          ? {
              ...previous,
              status: "REVOKED",
              integrationStatus: response.status
            }
          : previous
      );
      setResult(null);
      await loadImportPage();
      setNotice({
        kind: "success",
        text: "Gmail was disconnected and consent was revoked."
      });
    } catch (disconnectError) {
      setError(getImportErrorMessage(disconnectError));
    } finally {
      setBusyAction(null);
    }
  };

  const handleSync = async () => {
    setError(null);
    setNotice(null);
    setBusyAction("sync");

    try {
      const syncResult = await importApi.syncMailbox(PROVIDER);
      setResult(syncResult);
      await loadImportPage();
      setNotice({
        kind: "success",
        text: `Mailbox sync finished with status ${syncResult.status}.`
      });
    } catch (syncError) {
      const structured = getStructuredApiError(syncError);
      if (structured?.code === "MAILBOX_REAUTH_REQUIRED") {
        setNotice({
          kind: "error",
          text: structured.message ?? "Gmail access expired. Reconnect Gmail and retry."
        });
      } else if (structured?.code === "MAILBOX_CONNECTION_REQUIRED") {
        setNotice({
          kind: "error",
          text: structured.message ?? "Connect Gmail before mailbox sync."
        });
      }
      setError(getImportErrorMessage(syncError));
      await loadImportPage();
    } finally {
      setBusyAction(null);
    }
  };

  const handleLoadDetails = async (id: number) => {
    setError(null);
    setBusyAction("details");

    try {
      const details = await importApi.getById(id);
      setResult(details);
    } catch (detailsError) {
      setError(getImportErrorMessage(detailsError));
    } finally {
      setBusyAction(null);
    }
  };

  const handleManualImport = async () => {
    if (!canRunManualImport) {
      setError("Fill sender, subject and body before manual import.");
      return;
    }

    const payload: MailMessageRequest = {
      externalId: `manual-${Date.now()}`,
      from: manualFrom.trim(),
      subject: manualSubject.trim(),
      body: manualBody.trim(),
      receivedAt: new Date().toISOString()
    };

    setError(null);
    setNotice(null);
    setIsManualSubmitting(true);

    try {
      const manualResult = await importApi.start({
        provider: PROVIDER,
        messages: [payload]
      });
      setResult(manualResult);
      setManualFrom("");
      setManualSubject("");
      setManualBody("");
      await loadImportPage();
      setNotice({
        kind: "success",
        text: `Manual import finished with status ${manualResult.status}.`
      });
    } catch (manualError) {
      setError(getImportErrorMessage(manualError));
    } finally {
      setIsManualSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Import</Text>
      <Text style={styles.subtitle}>
        Connect Gmail with read-only access, sync billing emails, and review which subscriptions were imported,
        skipped or failed to parse.
      </Text>

      {notice ? (
        <View style={[styles.banner, notice.kind === "success" ? styles.bannerSuccess : styles.bannerError]}>
          <Text style={styles.bannerText}>{notice.text}</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gmail mailbox import</Text>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Consent</Text>
          <Text style={styles.meta}>Status: {consent?.status ?? (isLoading ? "Loading..." : "Unknown")}</Text>
          <Text style={styles.meta}>Scope: {consent?.scope ?? "Not granted yet"}</Text>
          <Text style={styles.meta}>Granted: {formatImportDateTime(consent?.grantedAt)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Connection</Text>
          <Text style={styles.meta}>
            Status: {integration?.status ?? (isLoading ? "Loading..." : "NOT_CONNECTED")}
          </Text>
          <Text style={styles.meta}>Mailbox: {integration?.externalAccountEmail ?? "Not connected"}</Text>
          <Text style={styles.meta}>Last sync: {formatImportDateTime(integration?.lastSyncAt)}</Text>
          {integration?.lastErrorMessage ? (
            <Text style={styles.meta}>Last Gmail error: {integration.lastErrorMessage}</Text>
          ) : null}
        </View>

        <Text style={styles.meta}>{connectionHint}</Text>

        <View style={styles.actions}>
          <AppButton
            title={busyAction === "connect" ? "Redirecting..." : isConnected ? "Reconnect Gmail" : "Connect Gmail"}
            onPress={() => void handleConnect()}
            disabled={busyAction !== null}
          />
          <AppButton
            title={busyAction === "sync" ? "Syncing..." : "Sync mailbox"}
            variant="ghost"
            onPress={() => void handleSync()}
            disabled={busyAction !== null || !canSync}
          />
          <AppButton
            title={busyAction === "disconnect" ? "Disconnecting..." : "Disconnect"}
            variant="ghost"
            onPress={() => void handleDisconnect()}
            disabled={busyAction !== null || (!integration?.id && !consent)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual import fallback</Text>
        <Text style={styles.meta}>
          This keeps current mobile behavior intact and uses the same backend import pipeline as mailbox sync.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Sender email"
          placeholderTextColor={colors.textMuted}
          value={manualFrom}
          onChangeText={setManualFrom}
        />
        <TextInput
          style={styles.input}
          placeholder="Email subject"
          placeholderTextColor={colors.textMuted}
          value={manualSubject}
          onChangeText={setManualSubject}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Email body"
          placeholderTextColor={colors.textMuted}
          value={manualBody}
          onChangeText={setManualBody}
        />
        <AppButton
          fullWidth
          title={isManualSubmitting ? "Importing..." : "Start manual import"}
          onPress={() => void handleManualImport()}
          disabled={!canRunManualImport || isManualSubmitting || busyAction !== null}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        {history.length === 0 ? <Text style={styles.meta}>{isLoading ? "Loading..." : "No import jobs."}</Text> : null}
        {history.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.itemTitle}>
              {item.provider} | {item.status}
            </Text>
            <Text style={styles.meta}>
              Started: {formatImportDateTime(item.startedAt)}{item.finishedAt ? ` | Finished: ${formatImportDateTime(item.finishedAt)}` : ""}
            </Text>
            <AppButton
              title="View details"
              variant="ghost"
              onPress={() => void handleLoadDetails(item.id)}
              disabled={busyAction === "details"}
            />
          </View>
        ))}
      </View>

      {result ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last result</Text>
          <View style={styles.card}>
            <Text style={styles.itemTitle}>Job #{result.jobId}</Text>
            <Text style={styles.meta}>Status: {result.status}</Text>
            <Text style={styles.meta}>
              Processed: {result.processed} | Created: {result.created} | Skipped: {result.skipped} | Errors: {result.errors}
            </Text>
            <Text style={styles.meta}>Started: {formatImportDateTime(result.startedAt)}</Text>
            <Text style={styles.meta}>Finished: {formatImportDateTime(result.finishedAt)}</Text>
          </View>

          {visibleItems.map((item) => (
            <View key={`${item.externalId}-${item.status}`} style={styles.card}>
              <Text style={styles.itemTitle}>{getImportItemSummary(item)}</Text>
              <Text style={styles.meta}>Status: {item.status}</Text>
              <Text style={styles.meta}>
                Source: {item.sourceProvider ?? "Unknown"}{item.receivedAt ? ` | Received: ${formatImportDateTime(item.receivedAt)}` : ""}
              </Text>
              <Text style={styles.meta}>
                {(item.billingPeriod ?? "Period unknown")}{item.nextBillingDate ? ` | Next billing: ${item.nextBillingDate}` : ""}
              </Text>
              {item.category ? <Text style={styles.meta}>Category: {item.category}</Text> : null}
              {item.reason ? <Text style={styles.meta}>Reason: {item.reason}</Text> : null}
            </View>
          ))}

          {result.errorItems.map((item) => (
            <View key={`${item.externalId ?? "message"}-${item.reason}`} style={styles.card}>
              <Text style={styles.itemTitle}>{item.externalId ?? "message"}</Text>
              <Text style={styles.meta}>{item.reason}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
};

const createStyles = (colors: AppPalette) =>
  StyleSheet.create({
    container: {
      padding: 16,
      gap: 14,
      backgroundColor: colors.bg
    },
    title: {
      fontSize: 30,
      fontWeight: "900",
      color: colors.text
    },
    subtitle: {
      color: colors.textMuted,
      lineHeight: 20
    },
    banner: {
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1
    },
    bannerSuccess: {
      backgroundColor: colors.bgSoft,
      borderColor: colors.accent
    },
    bannerError: {
      backgroundColor: colors.bgSoft,
      borderColor: colors.danger
    },
    bannerText: {
      color: colors.text,
      fontWeight: "700"
    },
    section: {
      gap: 8,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16
    },
    sectionTitle: {
      color: colors.text,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSoft,
      color: colors.text,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: "top"
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      gap: 6
    },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    error: {
      color: colors.danger
    },
    meta: {
      color: colors.textMuted
    },
    itemTitle: {
      color: colors.text,
      fontWeight: "800"
    }
  });

export default ImportScreen;
