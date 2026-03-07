package com.subscriptionmanager.analytics.dto;

import java.math.BigDecimal;

public record AnalyticsSummaryResponse(
        BigDecimal totalMonthly,
        BigDecimal totalYearly,
        long activeSubscriptions
) {
}
