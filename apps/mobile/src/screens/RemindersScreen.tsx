import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError } from "../api/httpClient";
import { notificationApi } from "../api/notificationApi";
import { subscriptionApi } from "../api/subscriptionApi";
import { useI18n } from "../context/SettingsContext";
import type { NotificationItem } from "../types/notification";
import type { Subscription } from "../types/subscription";

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
  const { tr } = useI18n();
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
          <Button key={option} title={`${option}`} onPress={() => setDays(option)} />
        ))}
      </View>
      <Text>
        {tr("days")}: {days}
      </Text>
      {isLoading ? <Text>{tr("loading")}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {items.length === 0 && !isLoading ? <Text>{tr("noReminders")}</Text> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text>{item.message}</Text>
          <Text>{item.type}</Text>
          <Text>{item.scheduledAt}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    gap: 4
  },
  error: {
    color: "#b91c1c"
  }
});

export default RemindersScreen;
