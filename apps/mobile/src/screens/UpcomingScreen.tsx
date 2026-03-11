import React, { useCallback, useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { subscriptionApi } from "../api/subscriptionApi";
import { useI18n } from "../context/SettingsContext";
import type { SubscriptionStatus, UpcomingSubscription } from "../types/subscription";

const dayOptions = [7, 30, 90];

const UpcomingScreen = () => {
  const { tr } = useI18n();
  const [days, setDays] = useState(7);
  const [items, setItems] = useState<UpcomingSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const formatStatus = (status: SubscriptionStatus) => {
    if (status === "ACTIVE") return tr("statusActive");
    if (status === "PAUSED") return tr("statusPaused");
    return tr("statusCanceled");
  };

  const load = useCallback(async (targetDays: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const upcomingResponse = await subscriptionApi.getUpcoming(targetDays);
      setItems(upcomingResponse);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : tr("failedLoadSubscriptions")
      );
    } finally {
      setIsLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  const onQuickStatusChange = async (item: UpcomingSubscription, nextStatus: SubscriptionStatus) => {
    try {
      setBusyId(item.id);
      setError(null);
      await subscriptionApi.update(item.id, {
        serviceName: item.serviceName,
        categoryId: null,
        amount: item.amount,
        currency: item.currency,
        billingPeriod: item.billingPeriod,
        nextBillingDate: item.nextBillingDate,
        status: nextStatus
      });
      await load(days);
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : tr("failedSaveSubscription")
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tr("tabUpcoming")}</Text>
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
      {items.length === 0 && !isLoading ? <Text>{tr("noUpcomingCharges")}</Text> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text>{item.serviceName}</Text>
          <Text>
            {item.amount} {item.currency}
          </Text>
          <Text>{tr("status")}: {formatStatus(item.status)}</Text>
          <Text>
            {tr("inDays")} {item.daysUntilBilling}
            {tr("dayShort")}
          </Text>
          <View style={styles.row}>
              <Button
                disabled={busyId === item.id || item.status === "PAUSED"}
                title={tr("pause")}
                onPress={() => void onQuickStatusChange(item, "PAUSED")}
              />
              <Button
                disabled={busyId === item.id || item.status === "CANCELED"}
                title={tr("cancel")}
                onPress={() => void onQuickStatusChange(item, "CANCELED")}
              />
              <Button
                disabled={busyId === item.id || item.status === "ACTIVE"}
                title={tr("activate")}
                onPress={() => void onQuickStatusChange(item, "ACTIVE")}
              />
          </View>
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

export default UpcomingScreen;
