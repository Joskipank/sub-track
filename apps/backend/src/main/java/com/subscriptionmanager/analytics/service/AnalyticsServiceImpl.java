package com.subscriptionmanager.analytics.service;

import com.subscriptionmanager.analytics.AnalyticsPeriod;
import com.subscriptionmanager.analytics.dto.AnalyticsByCategoryResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsCategoryItemResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsForecastResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsSummaryResponse;
import com.subscriptionmanager.common.enums.BillingPeriod;
import com.subscriptionmanager.common.enums.SubscriptionStatus;
import com.subscriptionmanager.entity.Subscription;
import com.subscriptionmanager.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final String MIXED_CURRENCY = "MIXED";
    private static final String UNCATEGORIZED = "Uncategorized";

    private final SubscriptionRepository subscriptionRepository;

    public AnalyticsServiceImpl(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse summary(Long userId, AnalyticsPeriod period) {
        LocalDate today = LocalDate.now();
        LocalDate from = period.rangeStart(today);
        LocalDate to = period.rangeEnd(today);

        List<SubscriptionSpend> spends = calculateSpendsForRange(userId, from, to);

        return new AnalyticsSummaryResponse(
                period.apiValue(),
                from,
                to,
                totalAmount(spends),
                spends.size(),
                resolveCurrency(spends)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsByCategoryResponse byCategory(Long userId, AnalyticsPeriod period) {
        LocalDate today = LocalDate.now();
        LocalDate from = period.rangeStart(today);
        LocalDate to = period.rangeEnd(today);

        List<SubscriptionSpend> spends = calculateSpendsForRange(userId, from, to);
        BigDecimal total = totalAmount(spends);

        Map<String, BigDecimal> amountByCategory = new LinkedHashMap<>();
        Map<String, Integer> subscriptionsCountByCategory = new LinkedHashMap<>();

        for (SubscriptionSpend spend : spends) {
            String category = resolveCategory(spend.subscription());
            amountByCategory.merge(category, spend.amount(), BigDecimal::add);
            subscriptionsCountByCategory.merge(category, 1, Integer::sum);
        }

        List<AnalyticsCategoryItemResponse> items = amountByCategory.entrySet()
                .stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue(Comparator.reverseOrder()))
                .map(entry -> new AnalyticsCategoryItemResponse(
                        entry.getKey(),
                        money(entry.getValue()),
                        percent(entry.getValue(), total),
                        subscriptionsCountByCategory.getOrDefault(entry.getKey(), 0)
                ))
                .toList();

        return new AnalyticsByCategoryResponse(
                period.apiValue(),
                from,
                to,
                total,
                resolveCurrency(spends),
                items
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsForecastResponse forecast(Long userId) {
        LocalDate today = LocalDate.now();

        LocalDate monthFrom = AnalyticsPeriod.MONTH.rangeStart(today);
        LocalDate monthTo = AnalyticsPeriod.MONTH.rangeEnd(today);

        LocalDate yearFrom = AnalyticsPeriod.YEAR.rangeStart(today);
        LocalDate yearTo = AnalyticsPeriod.YEAR.rangeEnd(today);

        List<SubscriptionSpend> monthSpends = calculateSpendsForRange(userId, monthFrom, monthTo);
        List<SubscriptionSpend> yearSpends = calculateSpendsForRange(userId, yearFrom, yearTo);

        return new AnalyticsForecastResponse(
                totalAmount(monthSpends),
                totalAmount(yearSpends),
                resolveCurrency(yearSpends)
        );
    }

    private List<SubscriptionSpend> calculateSpendsForRange(Long userId, LocalDate from, LocalDate to) {
        List<Subscription> activeSubscriptions = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE);
        List<SubscriptionSpend> spends = new ArrayList<>();

        for (Subscription subscription : activeSubscriptions) {
            long occurrences = occurrencesInRange(subscription, from, to);
            if (occurrences <= 0) {
                continue;
            }

            BigDecimal amountForRange = money(subscription.getAmount().multiply(BigDecimal.valueOf(occurrences)));
            spends.add(new SubscriptionSpend(subscription, amountForRange));
        }

        return spends;
    }

    private long occurrencesInRange(Subscription subscription, LocalDate from, LocalDate to) {
        LocalDate billingDate = subscription.getNextBillingDate();

        while (billingDate.isBefore(from)) {
            billingDate = nextDate(billingDate, subscription.getBillingPeriod());
        }

        long count = 0;
        while (!billingDate.isAfter(to)) {
            count++;
            billingDate = nextDate(billingDate, subscription.getBillingPeriod());
        }

        return count;
    }

    private LocalDate nextDate(LocalDate current, BillingPeriod billingPeriod) {
        return switch (billingPeriod) {
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case QUARTERLY -> current.plusMonths(3);
            case YEARLY -> current.plusYears(1);
        };
    }

    private BigDecimal totalAmount(List<SubscriptionSpend> spends) {
        return spends.stream()
                .map(SubscriptionSpend::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal percent(BigDecimal amount, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return amount.multiply(HUNDRED)
                .divide(total, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String resolveCurrency(List<SubscriptionSpend> spends) {
        Set<String> currencies = spends.stream()
                .map(spend -> spend.subscription().getCurrency())
                .filter(Objects::nonNull)
                .map(currency -> currency.trim().toUpperCase(Locale.ROOT))
                .collect(Collectors.toSet());

        if (currencies.isEmpty()) {
            return null;
        }

        if (currencies.size() == 1) {
            return currencies.iterator().next();
        }

        return MIXED_CURRENCY;
    }

    private String resolveCategory(Subscription subscription) {
        if (subscription.getCategory() == null || subscription.getCategory().getName() == null || subscription.getCategory().getName().isBlank()) {
            return UNCATEGORIZED;
        }

        return subscription.getCategory().getName();
    }

    private record SubscriptionSpend(Subscription subscription, BigDecimal amount) {
    }
}
