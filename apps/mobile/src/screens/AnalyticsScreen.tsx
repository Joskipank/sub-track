import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { analyticsApi } from "../api/analyticsApi";
import { ApiError } from "../api/httpClient";
import { useI18n } from "../context/SettingsContext";
import type { AnalyticsByCategory, AnalyticsForecast, AnalyticsPeriod, AnalyticsSummary } from "../types/analytics";
import type { AppPalette } from "../theme/theme";

const AnalyticsScreen = () => {
  const { tr, colors } = useI18n();
  const styles = createStyles(colors);
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
        {(["month", "year"] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.pill, period === option ? styles.pillActive : null]}
            onPress={() => setPeriod(option)}
          >
            <Text style={[styles.pillText, period === option ? styles.pillTextActive : null]}>
              {option === "month" ? tr("month") : tr("year")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? <Text style={styles.meta}>{tr("loading")}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("summary")} ({summary.period})</Text>
          <Text style={styles.metric}>{summary.totalAmount}</Text>
          <Text style={styles.meta}>{tr("activeSubscriptions")}: {summary.activeSubscriptions}</Text>
          <Text style={styles.meta}>
            {tr("range")}: {summary.from} - {summary.to}
          </Text>
        </View>
      ) : null}

      {byCategory ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("byCategory")}</Text>
          {byCategory.items.length === 0 ? <Text style={styles.meta}>{tr("noCategories")}</Text> : null}
          {byCategory.items.map((item) => (
            <View key={item.category} style={styles.itemRow}>
              <Text style={styles.itemLabel}>{item.category}</Text>
              <Text style={styles.itemValue}>
                {item.amount} ({item.sharePercent}%)
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {forecast ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("forecast")}</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>{tr("month")}</Text>
            <Text style={styles.itemValue}>{forecast.monthForecast}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>{tr("year")}</Text>
            <Text style={styles.itemValue}>{forecast.yearForecast}</Text>
          </View>
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
  row: {
    flexDirection: "row",
    gap: 8
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  pillText: {
    color: colors.text,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  pillTextActive: {
    color: colors.accentText
  },
  section: {
    gap: 10,
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  metric: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: "900"
  },
  meta: {
    color: colors.textMuted
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderRadius: 12,
    padding: 12
  },
  itemLabel: {
    color: colors.text,
    fontWeight: "700"
  },
  itemValue: {
    color: colors.accent,
    fontWeight: "800"
  },
  error: {
    color: colors.danger
  }
});

export default AnalyticsScreen;
