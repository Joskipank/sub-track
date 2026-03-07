package com.subscriptionmanager.subscription.dto;

import com.subscriptionmanager.common.enums.BillingPeriod;
import com.subscriptionmanager.common.enums.SubscriptionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubscriptionRequest(
        String serviceName,
        Long categoryId,
        BigDecimal amount,
        String currency,
        BillingPeriod billingPeriod,
        LocalDate nextBillingDate,
        SubscriptionStatus status
) {
}
