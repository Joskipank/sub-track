import React, { useCallback, useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { analyticsApi } from "../api/analyticsApi";
import { ApiError } from "../api/httpClient";
import { useI18n } from "../context/SettingsContext";
import type { AnalyticsByCategory, AnalyticsForecast, AnalyticsPeriod, AnalyticsSummary } from "../types/analytics";

const AnalyticsScreen = () => {
  const { tr } = useI18n();
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byCategory, setByCategory] = useState<AnalyticsByCategory | null>(null);
  const [forecast, setForecast] = useState<AnalyticsForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (targetPeriod: AnalyticsPeriod) => {
    try {
      setIsLoading(true);
      setError(null);
      const [summaryResponse, byCategoryResponse, forecastResponse] = await Promise.all([
        analyticsApi.getSummary(targetPeriod),
        analyticsApi.getByCategory(targetPeriod),
        analyticsApi.getForecast()
      ]);
      setSummary(summaryResponse);
      setByCategory(byCategoryResponse);
      setForecast(forecastResponse);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError && loadError.status === 400
          ? "Invalid analytics period."
          : loadError instanceof Error
            ? loadError.message
            : tr("failedLoadAnalytics")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics(period);
  }, [loadAnalytics, period]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tr("analyticsTitle")}</Text>
      <View style={styles.row}>
        <Button title={tr("month")} onPress={() => setPeriod("month")} />
        <Button title={tr("year")} onPress={() => setPeriod("year")} />
      </View>
      {isLoading ? <Text>{tr("loading")}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("summary")} ({summary.period})</Text>
          <Text>{tr("total")}: {summary.totalAmount}</Text>
          <Text>{tr("activeSubscriptions")}: {summary.activeSubscriptions}</Text>
          <Text>
            {tr("range")}: {summary.from} - {summary.to}
          </Text>
        </View>
      ) : null}

      {byCategory ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("byCategory")}</Text>
          {byCategory.items.length === 0 ? <Text>{tr("noCategories")}</Text> : null}
          {byCategory.items.map((item) => (
            <Text key={item.category}>
              {item.category}: {item.amount} ({item.sharePercent}%)
            </Text>
          ))}
        </View>
      ) : null}

      {forecast ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("forecast")}</Text>
          <Text>{tr("month")}: {forecast.monthForecast}</Text>
          <Text>{tr("year")}: {forecast.yearForecast}</Text>
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
  row: {
    flexDirection: "row",
    gap: 8
  },
  section: {
    gap: 6
  },
  sectionTitle: {
    fontWeight: "700"
  },
  error: {
    color: "#b91c1c"
  }
});

export default AnalyticsScreen;
