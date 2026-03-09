import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ApiError } from "../api/httpClient";
import { categoryApi } from "../api/categoryApi";
import { notificationApi } from "../api/notificationApi";
import { subscriptionApi } from "../api/subscriptionApi";
import { useI18n } from "../context/SettingsContext";
import type { Category } from "../types/category";
import type { NotificationItem } from "../types/notification";
import type {
  BillingPeriod,
  Subscription,
  SubscriptionRequest,
  SubscriptionStatus,
  UpcomingSubscription
} from "../types/subscription";

const billingPeriods: BillingPeriod[] = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];
const statusOptions: Array<SubscriptionStatus | "ALL"> = ["ALL", "ACTIVE", "PAUSED", "CANCELED"];
const currencies = [
  { code: "USD", label: "USD" },
  { code: "RUB", label: "RUB" }
];

const filterOrphanNotifications = (
  notifications: NotificationItem[],
  subscriptions: Subscription[]
) => {
  const subscriptionIds = new Set(subscriptions.map((item) => item.id));
  return notifications.filter((notification) =>
    notification.subscriptionId == null ? true : subscriptionIds.has(notification.subscriptionId)
  );
};

const initialForm: SubscriptionRequest = {
  serviceName: "",
  categoryId: null,
  amount: 9.99,
  currency: "USD",
  billingPeriod: "MONTHLY",
  nextBillingDate: ""
};

const SubscriptionsScreen = () => {
  const { tr } = useI18n();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingSubscription[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"NEXT_ASC" | "AMOUNT_DESC">("NEXT_ASC");
  const [form, setForm] = useState<SubscriptionRequest>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentCategoryName = useMemo(
    () => categories.find((item) => item.id === form.categoryId)?.name ?? tr("none"),
    [categories, form.categoryId, tr]
  );

  const visibleSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = subscriptions.filter((subscription) => {
      const byStatus = statusFilter === "ALL" || subscription.status === statusFilter;
      const bySearch =
        normalizedQuery.length === 0 ||
        subscription.serviceName.toLowerCase().includes(normalizedQuery) ||
        (subscription.category ?? "").toLowerCase().includes(normalizedQuery);
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
      const [subsRes, catsRes, upcomingRes, notificationsRes] = await Promise.all([
        subscriptionApi.getAll(),
        categoryApi.getAll(),
        subscriptionApi.getUpcoming(7),
        notificationApi.getByDays(7)
      ]);
      setSubscriptions(subsRes);
      setCategories(catsRes);
      setUpcoming(upcomingRes);
      setNotifications(filterOrphanNotifications(notificationsRes, subsRes));
    } catch (loadError) {
      setError(
        loadError instanceof ApiError && loadError.status === 400
          ? "Invalid days value for upcoming/reminders."
          : loadError instanceof Error
            ? loadError.message
            : tr("failedLoadSubscriptions")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
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

      if (editingId) {
        await subscriptionApi.update(editingId, form);
      } else {
        await subscriptionApi.create(form);
      }

      resetForm();
      await loadAll();
    } catch (submitError) {
      setError(
        submitError instanceof ApiError && submitError.status === 400
          ? "Invalid subscription payload."
          : submitError instanceof Error
            ? submitError.message
            : tr("failedSaveSubscription")
      );
    }
  };

  const onEdit = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setForm({
      serviceName: subscription.serviceName,
      categoryId: categories.find((item) => item.name === subscription.category)?.id ?? null,
      amount: subscription.amount,
      currency: subscription.currency,
      billingPeriod: subscription.billingPeriod,
      nextBillingDate: subscription.nextBillingDate,
      status: subscription.status
    });
  };

  const onDelete = async (id: number) => {
    try {
      setError(null);
      await subscriptionApi.remove(id);
      await loadAll();
    } catch (deleteError) {
      setError(
        deleteError instanceof ApiError && deleteError.status === 400
          ? "Invalid subscription id."
          : deleteError instanceof Error
            ? deleteError.message
            : tr("failedDeleteSubscription")
      );
    }
  };

  const onLoadDetails = async (id: number) => {
    try {
      setError(null);
      const details = await subscriptionApi.getById(id);
      setSelectedSubscription(details);
    } catch (detailsError) {
      setError(
        detailsError instanceof ApiError && detailsError.status === 400
          ? "Invalid subscription id."
          : detailsError instanceof Error
            ? detailsError.message
            : tr("failedLoadDetails")
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tr("subscriptionsTitle")}</Text>
      {isLoading ? <Text>{tr("loading")}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{editingId ? `${tr("editWithId")}${editingId}` : tr("createSubscription")}</Text>
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

        <Text>{tr("billingPeriod")}: {form.billingPeriod}</Text>
        <View style={styles.row}>
          {billingPeriods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.pill, form.billingPeriod === period ? styles.pillActive : null]}
              onPress={() => setForm((prev) => ({ ...prev, billingPeriod: period }))}
            >
              <Text>{period}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text>{tr("category")}: {currentCategoryName}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <TouchableOpacity
            style={[styles.pill, form.categoryId === null ? styles.pillActive : null]}
            onPress={() => setForm((prev) => ({ ...prev, categoryId: null }))}
          >
            <Text>{tr("none")}</Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.pill, form.categoryId === category.id ? styles.pillActive : null]}
              onPress={() => setForm((prev) => ({ ...prev, categoryId: category.id }))}
            >
              <Text>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.row}>
          <Button title={editingId ? tr("update") : tr("create")} onPress={() => void onSubmit()} />
          {editingId ? <Button title={tr("cancel")} onPress={resetForm} /> : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr("list")}</Text>
        <TextInput
          placeholder="Search service/category"
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text>Status filter</Text>
        <View style={styles.row}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.pill, statusFilter === option ? styles.pillActive : null]}
              onPress={() => setStatusFilter(option)}
            >
              <Text>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text>Sort by</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.pill, sortMode === "NEXT_ASC" ? styles.pillActive : null]}
            onPress={() => setSortMode("NEXT_ASC")}
          >
            <Text>Next date</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, sortMode === "AMOUNT_DESC" ? styles.pillActive : null]}
            onPress={() => setSortMode("AMOUNT_DESC")}
          >
            <Text>Amount desc</Text>
          </TouchableOpacity>
        </View>

        {visibleSubscriptions.length === 0 ? <Text>{tr("noSubscriptions")}</Text> : null}
        {visibleSubscriptions.map((subscription) => (
          <View key={subscription.id} style={styles.card}>
            <Text>{subscription.serviceName}</Text>
            <Text>
              {subscription.amount} {subscription.currency} | {subscription.billingPeriod}
            </Text>
            <Text>Next: {subscription.nextBillingDate}</Text>
            <Text>{tr("status")}: {subscription.status}</Text>
            <View style={styles.row}>
              <Button title={tr("details")} onPress={() => void onLoadDetails(subscription.id)} />
              <Button title={tr("edit")} onPress={() => onEdit(subscription)} />
              <Button title={tr("delete")} onPress={() => void onDelete(subscription.id)} />
            </View>
          </View>
        ))}
      </View>

      {selectedSubscription ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("detailsWithId")}{selectedSubscription.id}</Text>
          <Text>{tr("service")}: {selectedSubscription.serviceName}</Text>
          <Text>{tr("category")}: {selectedSubscription.category || tr("none")}</Text>
          <Text>
            {tr("amount")}: {selectedSubscription.amount} {selectedSubscription.currency}
          </Text>
          <Text>{tr("period")}: {selectedSubscription.billingPeriod}</Text>
          <Text>{tr("status")}: {selectedSubscription.status}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr("upcomingDays")}</Text>
        {upcoming.length === 0 ? <Text>{tr("noUpcomingCharges")}</Text> : null}
        {upcoming.map((item) => (
          <Text key={item.id}>
            {item.serviceName}: {item.amount} {item.currency}, {tr("inDays")} {item.daysUntilBilling}
            {tr("dayShort")}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr("remindersDays")}</Text>
        {notifications.length === 0 ? <Text>{tr("noReminders")}</Text> : null}
        {notifications.map((item) => (
          <Text key={item.id}>{item.message}</Text>
        ))}
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
  }
});

export default SubscriptionsScreen;
