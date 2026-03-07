package com.subscriptionmanager.analytics.service;

import com.subscriptionmanager.analytics.dto.AnalyticsSummaryResponse;

import java.time.LocalDate;

public interface AnalyticsService {
    AnalyticsSummaryResponse summary(Long userId, LocalDate from, LocalDate to);
}
