package com.subscriptionmanager.analytics.service;

import com.subscriptionmanager.analytics.AnalyticsPeriod;
import com.subscriptionmanager.analytics.dto.AnalyticsByCategoryResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsCategoryItemResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsForecastResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsSummaryResponse;
import com.subscriptionmanager.common.enums.BillingPeriod;
import com.subscriptionmanager.common.enums.SubscriptionStatus;
import com.subscriptionmanager.entity.Category;
import com.subscriptionmanager.entity.Subscription;
import com.subscriptionmanager.repository.SubscriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceImplTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Test
    void summaryCountsOnlyActiveSubscriptionsWithChargesInCalendarMonth() {
        AnalyticsServiceImpl service = new AnalyticsServiceImpl(subscriptionRepository);
        LocalDate today = LocalDate.now();

        Subscription inRange = subscription("Netflix", BigDecimal.valueOf(12.99), "USD", BillingPeriod.MONTHLY, today.withDayOfMonth(1), SubscriptionStatus.ACTIVE, category("Entertainment"));
        Subscription outOfRange = subscription("Yearly Tool", BigDecimal.valueOf(100), "USD", BillingPeriod.YEARLY, today.plusMonths(1), SubscriptionStatus.ACTIVE, category("Productivity"));

        when(subscriptionRepository.findByUserIdAndStatus(1L, SubscriptionStatus.ACTIVE))
                .thenReturn(List.of(inRange, outOfRange));

        AnalyticsSummaryResponse response = service.summary(1L, AnalyticsPeriod.MONTH);

        assertEquals("month", response.period());
        assertEquals(BigDecimal.valueOf(12.99).setScale(2), response.totalAmount());
        assertEquals(1, response.activeSubscriptions());
        assertEquals("USD", response.currency());
    }

    @Test
    void byCategoryRoundsSharePercentAndUsesUncategorized() {
        AnalyticsServiceImpl service = new AnalyticsServiceImpl(subscriptionRepository);
        LocalDate today = LocalDate.now();

        Subscription entertainment = subscription("Netflix", BigDecimal.valueOf(10), "USD", BillingPeriod.MONTHLY, today.withDayOfMonth(1), SubscriptionStatus.ACTIVE, category("Entertainment"));
        Subscription uncategorized = subscription("Unknown", BigDecimal.valueOf(30), "USD", BillingPeriod.MONTHLY, today.withDayOfMonth(1), SubscriptionStatus.ACTIVE, null);

        when(subscriptionRepository.findByUserIdAndStatus(1L, SubscriptionStatus.ACTIVE))
                .thenReturn(List.of(entertainment, uncategorized));

        AnalyticsByCategoryResponse response = service.byCategory(1L, AnalyticsPeriod.MONTH);

        assertEquals(BigDecimal.valueOf(40).setScale(2), response.totalAmount());
        assertEquals(2, response.items().size());

        AnalyticsCategoryItemResponse first = response.items().getFirst();
        AnalyticsCategoryItemResponse second = response.items().get(1);

        assertEquals("Uncategorized", first.category());
        assertEquals(BigDecimal.valueOf(75.00).setScale(2), first.sharePercent());
        assertEquals("Entertainment", second.category());
        assertEquals(BigDecimal.valueOf(25.00).setScale(2), second.sharePercent());
    }

    @Test
    void forecastReturnsMonthAndYearTotalsForCalendarRanges() {
        AnalyticsServiceImpl service = new AnalyticsServiceImpl(subscriptionRepository);
        LocalDate today = LocalDate.now();

        Subscription yearly = subscription("Insurance", BigDecimal.valueOf(50), "USD", BillingPeriod.YEARLY, today, SubscriptionStatus.ACTIVE, category("Finance"));

        when(subscriptionRepository.findByUserIdAndStatus(1L, SubscriptionStatus.ACTIVE))
                .thenReturn(List.of(yearly));

        AnalyticsForecastResponse response = service.forecast(1L);

        assertEquals(BigDecimal.valueOf(50).setScale(2), response.monthForecast());
        assertEquals(BigDecimal.valueOf(50).setScale(2), response.yearForecast());
        assertEquals("USD", response.currency());
    }

    @Test
    void byCategoryReturnsEmptyItemsWhenNothingFallsIntoRange() {
        AnalyticsServiceImpl service = new AnalyticsServiceImpl(subscriptionRepository);
        LocalDate today = LocalDate.now();

        Subscription nextYear = subscription("Annual", BigDecimal.valueOf(100), "USD", BillingPeriod.YEARLY, today.plusYears(1), SubscriptionStatus.ACTIVE, category("Finance"));

        when(subscriptionRepository.findByUserIdAndStatus(1L, SubscriptionStatus.ACTIVE))
                .thenReturn(List.of(nextYear));

        AnalyticsByCategoryResponse response = service.byCategory(1L, AnalyticsPeriod.MONTH);

        assertEquals(BigDecimal.ZERO.setScale(2), response.totalAmount());
        assertEquals(0, response.items().size());
    }

    private Subscription subscription(
            String serviceName,
            BigDecimal amount,
            String currency,
            BillingPeriod billingPeriod,
            LocalDate nextBillingDate,
            SubscriptionStatus status,
            Category category
    ) {
        Subscription subscription = new Subscription();
        subscription.setServiceName(serviceName);
        subscription.setAmount(amount);
        subscription.setCurrency(currency);
        subscription.setBillingPeriod(billingPeriod);
        subscription.setNextBillingDate(nextBillingDate);
        subscription.setStatus(status);
        subscription.setCategory(category);
        return subscription;
    }

    private Category category(String name) {
        Category category = new Category();
        category.setName(name);
        return category;
    }
}
