import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { subscriptionApi } from "../api/subscriptionApi";
import { useI18n } from "../context/SettingsContext";
import type { BillingPeriod, Subscription, SubscriptionRequest, SubscriptionStatus } from "../types/subscription";

const billingPeriods: BillingPeriod[] = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];
const statusOptions: Array<SubscriptionStatus | "ALL"> = ["ALL", "ACTIVE", "PAUSED", "CANCELED"];
const currencies = [
  { code: "USD", label: "USD" },
  { code: "RUB", label: "RUB" }
];

const initialForm: SubscriptionRequest = {
  serviceName: "",
  amount: 9.99,
  currency: "USD",
  billingPeriod: "MONTHLY",
  nextBillingDate: ""
};

const SubscriptionsScreen = () => {
  const { tr } = useI18n();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"NEXT_ASC" | "AMOUNT_DESC">("NEXT_ASC");
  const [form, setForm] = useState<SubscriptionRequest>(initialForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatBillingPeriod = useCallback(
    (period: BillingPeriod) => {
      if (period === "WEEKLY") return tr("periodWeekly");
      if (period === "MONTHLY") return tr("periodMonthly");
      if (period === "QUARTERLY") return tr("periodQuarterly");
      if (period === "YEARLY") return tr("periodYearly");
      return period;
    },
    [tr]
  );

  const formatStatus = useCallback(
    (status: SubscriptionStatus | "ALL") => {
      if (status === "ALL") return tr("statusAll");
      if (status === "ACTIVE") return tr("statusActive");
      if (status === "PAUSED") return tr("statusPaused");
      return tr("statusCanceled");
    },
    [tr]
  );

  const visibleSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = subscriptions.filter((subscription) => {
      const byStatus = statusFilter === "ALL" || subscription.status === statusFilter;
      const bySearch =
        normalizedQuery.length === 0 ||
        subscription.serviceName.toLowerCase().includes(normalizedQuery);
      return byStatus && bySearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === "AMOUNT_DESC") {
        return b.amount - a.amount;
      }
      return a.nextBillingDate.localeCompare(b.nextBillingDate);
    });

    return sorted;
  }, [searchQuery, sortMode, statusFilter, subscriptions]);

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const subsRes = await subscriptionApi.getAll();
      setSubscriptions(subsRes);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tr("failedLoadSubscriptions"));
    } finally {
      setIsLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const onSubmit = async () => {
    try {
      setError(null);
      if (!form.serviceName.trim() || !form.nextBillingDate.trim()) {
        setError(tr("requiredFields"));
        return;
      }
      if (form.amount <= 0) {
        setError(tr("amountPositive"));
        return;
      }

      const payload: SubscriptionRequest = {
        serviceName: form.serviceName.trim(),
        amount: form.amount,
        currency: form.currency,
        billingPeriod: form.billingPeriod,
        nextBillingDate: form.nextBillingDate.trim(),
        status: form.status
      };

      if (editingId) {
        await subscriptionApi.update(editingId, payload);
      } else {
        await subscriptionApi.create(payload);
      }

      resetForm();
      await loadAll();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : tr("failedSaveSubscription")
      );
    }
  };

  const onEdit = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setForm({
      serviceName: subscription.serviceName,
      amount: subscription.amount,
      currency: subscription.currency,
      billingPeriod: subscription.billingPeriod,
      nextBillingDate: subscription.nextBillingDate,
      status: subscription.status
    });
    setIsFormOpen(true);
  };

  const onDelete = async (id: number) => {
    try {
      setError(null);
      await subscriptionApi.remove(id);
      await loadAll();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : tr("failedDeleteSubscription")
      );
    }
  };

  const onDeletePress = (id: number) => {
    Alert.alert(tr("confirmDeleteTitle"), tr("confirmDeleteMessage"), [
      { text: tr("cancel"), style: "cancel" },
      {
        text: tr("delete"),
        style: "destructive",
        onPress: () => void onDelete(id)
      }
    ]);
  };

  const onLoadDetails = async (id: number) => {
    try {
      setError(null);
      const details = await subscriptionApi.getById(id);
      setSelectedSubscription(details);
    } catch (detailsError) {
      setError(
        detailsError instanceof Error ? detailsError.message : tr("failedLoadDetails")
      );
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tr("subscriptionsTitle")}</Text>
      {isLoading ? <Text>{tr("loading")}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr("list")}</Text>
        <TextInput
          placeholder={tr("searchByService")}
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text>{tr("statusFilter")}</Text>
        <View style={styles.row}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.pill, statusFilter === option ? styles.pillActive : null]}
              onPress={() => setStatusFilter(option)}
            >
              <Text>{formatStatus(option)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text>{tr("sortBy")}</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.pill, sortMode === "NEXT_ASC" ? styles.pillActive : null]}
            onPress={() => setSortMode("NEXT_ASC")}
          >
            <Text>{tr("sortNextDate")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, sortMode === "AMOUNT_DESC" ? styles.pillActive : null]}
            onPress={() => setSortMode("AMOUNT_DESC")}
          >
            <Text>{tr("sortAmountDesc")}</Text>
          </TouchableOpacity>
        </View>

        {visibleSubscriptions.length === 0 ? <Text>{tr("noSubscriptions")}</Text> : null}
        {visibleSubscriptions.map((subscription) => (
          <View key={subscription.id} style={styles.card}>
            <Text>{subscription.serviceName}</Text>
            <Text>
              {subscription.amount} {subscription.currency} | {formatBillingPeriod(subscription.billingPeriod)}
            </Text>
            <Text>{tr("nextLabel")}: {subscription.nextBillingDate}</Text>
            <Text>
              {tr("status")}: {formatStatus(subscription.status)}
            </Text>
            <View style={styles.row}>
              <Button title={tr("details")} onPress={() => void onLoadDetails(subscription.id)} />
              <Button title={tr("edit")} onPress={() => onEdit(subscription)} />
              <Button title={tr("delete")} onPress={() => onDeletePress(subscription.id)} />
            </View>
          </View>
        ))}
      </View>

      {selectedSubscription ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr("detailsWithId")}
            {selectedSubscription.id}
          </Text>
          <Text>
            {tr("service")}: {selectedSubscription.serviceName}
          </Text>
          <Text>
            {tr("amount")}: {selectedSubscription.amount} {selectedSubscription.currency}
          </Text>
          <Text>
            {tr("period")}: {formatBillingPeriod(selectedSubscription.billingPeriod)}
          </Text>
          <Text>
            {tr("status")}: {formatStatus(selectedSubscription.status)}
          </Text>
        </View>
      ) : null}

      {isFormOpen ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {editingId ? `${tr("editWithId")}${editingId}` : tr("createSubscription")}
          </Text>
          <TextInput
            placeholder={tr("serviceName")}
            style={styles.input}
            value={form.serviceName}
            onChangeText={(value) => setForm((prev) => ({ ...prev, serviceName: value }))}
          />
          <TextInput
            placeholder={tr("amount")}
            keyboardType="numeric"
            style={styles.input}
            value={String(form.amount)}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, amount: Number(value.replace(",", ".")) || 0 }))
            }
          />
          <Text>{tr("currency")}</Text>
          <View style={styles.row}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[styles.pill, form.currency === currency.code ? styles.pillActive : null]}
                onPress={() => setForm((prev) => ({ ...prev, currency: currency.code }))}
              >
                <Text>{currency.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            placeholder={tr("nextBillingDate")}
            style={styles.input}
            value={form.nextBillingDate}
            onChangeText={(value) => setForm((prev) => ({ ...prev, nextBillingDate: value }))}
          />

          <Text>
            {tr("billingPeriod")}: {formatBillingPeriod(form.billingPeriod)}
          </Text>
          <View style={styles.row}>
            {billingPeriods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.pill, form.billingPeriod === period ? styles.pillActive : null]}
                onPress={() => setForm((prev) => ({ ...prev, billingPeriod: period }))}
              >
                <Text>{formatBillingPeriod(period)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <Button title={editingId ? tr("update") : tr("create")} onPress={() => void onSubmit()} />
            <Button title={tr("cancel")} onPress={resetForm} />
          </View>
        </View>
      ) : null}
      </ScrollView>

      {!isFormOpen ? (
        <View style={styles.bottomAction}>
          <Button title={tr("createSubscription")} onPress={() => setIsFormOpen(true)} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 96
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  pill: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  pillActive: {
    backgroundColor: "#dbeafe"
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
  },
  bottomAction: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff"
  }
});

export default SubscriptionsScreen;
