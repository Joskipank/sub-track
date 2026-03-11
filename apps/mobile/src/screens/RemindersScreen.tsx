import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ApiError } from "../api/httpClient";
import { notificationApi } from "../api/notificationApi";
import { subscriptionApi } from "../api/subscriptionApi";
import { useI18n } from "../context/SettingsContext";
import type { NotificationItem } from "../types/notification";
import type { Subscription } from "../types/subscription";
import type { AppPalette } from "../theme/theme";

const dayOptions = [7, 30, 90];

const filterOrphanNotifications = (
  notifications: NotificationItem[],
  subscriptions: Subscription[]
) => {
  const subscriptionIds = new Set(subscriptions.map((item) => item.id));
  return notifications.filter((notification) =>
    notification.subscriptionId == null ? true : subscriptionIds.has(notification.subscriptionId)
  );
};

const RemindersScreen = () => {
  const { tr, colors } = useI18n();
  const styles = createStyles(colors);
  const [days, setDays] = useState(7);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetDays: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const [notificationsResponse, subscriptionsResponse] = await Promise.all([
        notificationApi.getByDays(targetDays),
        subscriptionApi.getAll()
      ]);
      setItems(filterOrphanNotifications(notificationsResponse, subscriptionsResponse));
    } catch (loadError) {
      setError(
        loadError instanceof ApiError && loadError.status === 400
          ? "Invalid days value for reminders."
          : loadError instanceof Error
            ? loadError.message
            : tr("failedLoadDetails")
      );
    } finally {
      setIsLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  useFocusEffect(
    useCallback(() => {
      void load(days);
    }, [days, load])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tr("tabReminders")}</Text>
      <View style={styles.row}>
        {dayOptions.map((option) => (
          <TouchableOpacity key={option} style={[styles.pill, days === option ? styles.pillActive : null]} onPress={() => setDays(option)}>
            <Text style={[styles.pillText, days === option ? styles.pillTextActive : null]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.meta}>
        {tr("days")}: {days}
      </Text>
      {isLoading ? <Text style={styles.meta}>{tr("loading")}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {items.length === 0 && !isLoading ? <Text style={styles.meta}>{tr("noReminders")}</Text> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.message}</Text>
          <Text style={styles.meta}>{item.type}</Text>
          <Text style={styles.meta}>{item.scheduledAt}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const createStyles = (colors: AppPalette) =>
  StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.bg
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.text
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  pill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    paddingVertical: 12
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  pillText: {
    color: colors.text,
    fontWeight: "800"
  },
  pillTextActive: {
    color: colors.accentText
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    padding: 12,
    gap: 4
  },
  error: {
    color: colors.danger
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "700"
  },
  meta: {
    color: colors.textMuted
  }
});

export default RemindersScreen;
