package com.subscriptionmanager.analytics.service;

import com.subscriptionmanager.analytics.dto.AnalyticsSummaryResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {
    @Override
    public AnalyticsSummaryResponse summary(Long userId, LocalDate from, LocalDate to) {
        return new AnalyticsSummaryResponse(BigDecimal.ZERO, BigDecimal.ZERO, 0);
    }
}
