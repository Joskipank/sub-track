import React, { useCallback, useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError } from "../api/httpClient";
import { dashboardApi } from "../api/dashboardApi";
import { userApi } from "../api/userApi";
import type { DashboardResponse } from "../types/dashboard";
import type { UserProfile } from "../types/user";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../context/SettingsContext";

const DashboardScreen = () => {
  const { profileName } = useAuth();
  const { tr } = useI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileResponse, dashboardResponse] = await Promise.all([
        userApi.getMe(),
        dashboardApi.getDashboard("month", 7)
      ]);
      setProfile(profileResponse);
      setDashboard(dashboardResponse);
    } catch (loadError) {
      const message =
        loadError instanceof ApiError && loadError.status === 400
          ? "Invalid dashboard params: period/days."
          : loadError instanceof Error
            ? loadError.message
            : tr("failedLoadDashboard");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tr("dashboardTitle")}</Text>
      <Text style={styles.subtitle}>{profile ? `${tr("signedInAs")} ${profile.email}` : tr("loadingProfile")}</Text>
      {profileName ? <Text style={styles.subtitle}>{tr("name")}: {profileName}</Text> : null}

      {isLoading ? <Text>{tr("loading")}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {dashboard ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("summary")}</Text>
          <Text>{tr("total")}: {dashboard.summary.totalAmount}</Text>
          <Text>{tr("activeSubscriptions")}: {dashboard.summary.activeSubscriptions}</Text>
          <Text>{tr("period")}: {dashboard.summary.from} - {dashboard.summary.to}</Text>

          <Text style={styles.sectionTitle}>{tr("forecast")}</Text>
          <Text>{tr("month")}: {dashboard.forecast.monthForecast}</Text>
          <Text>{tr("year")}: {dashboard.forecast.yearForecast}</Text>

          <Text style={styles.sectionTitle}>{tr("upcoming")}</Text>
          {dashboard.upcoming.length === 0 ? <Text>{tr("noUpcomingCharges")}</Text> : null}
          {dashboard.upcoming.map((item) => (
            <Text key={item.id}>
              {item.serviceName}: {item.amount} {item.currency} {tr("inDays")} {item.daysUntilBilling}
              {tr("dayShort")}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>{tr("notifications")}</Text>
          {dashboard.notifications.length === 0 ? <Text>{tr("noReminders")}</Text> : null}
          {dashboard.notifications.map((item) => (
            <Text key={item.id}>{item.message}</Text>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button title={tr("reload")} onPress={() => void loadDashboard()} />
      </View>
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
  subtitle: {
    color: "#4b5563"
  },
  section: {
    gap: 6
  },
  sectionTitle: {
    marginTop: 8,
    fontWeight: "700"
  },
  actions: {
    gap: 8
  },
  error: {
    color: "#b91c1c"
  }
});

export default DashboardScreen;
