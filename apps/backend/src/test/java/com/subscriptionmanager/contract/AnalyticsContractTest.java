package com.subscriptionmanager.contract;

import com.subscriptionmanager.analytics.AnalyticsPeriod;
import com.subscriptionmanager.analytics.controller.AnalyticsController;
import com.subscriptionmanager.analytics.dto.AnalyticsByCategoryResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsCategoryItemResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsForecastResponse;
import com.subscriptionmanager.analytics.dto.AnalyticsSummaryResponse;
import com.subscriptionmanager.analytics.service.AnalyticsService;
import com.subscriptionmanager.exception.GlobalExceptionHandler;
import com.subscriptionmanager.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AnalyticsContractTest {

    private AnalyticsService analyticsService;
    private CurrentUserService currentUserService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        analyticsService = Mockito.mock(AnalyticsService.class);
        currentUserService = Mockito.mock(CurrentUserService.class);

        AnalyticsController controller = new AnalyticsController(analyticsService, currentUserService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void analyticsSummaryContract() throws Exception {
        when(currentUserService.requireCurrentUserId()).thenReturn(1L);
        when(analyticsService.summary(1L, AnalyticsPeriod.MONTH))
                .thenReturn(new AnalyticsSummaryResponse(
                        "month",
                        LocalDate.of(2026, 3, 1),
                        LocalDate.of(2026, 3, 31),
                        BigDecimal.valueOf(39.97),
                        4,
                        "USD"
                ));

        mockMvc.perform(get("/api/v1/analytics/summary").queryParam("period", "month"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("month"))
                .andExpect(jsonPath("$.from").exists())
                .andExpect(jsonPath("$.to").exists())
                .andExpect(jsonPath("$.totalAmount").value(39.97))
                .andExpect(jsonPath("$.activeSubscriptions").value(4))
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    void analyticsByCategoryContract() throws Exception {
        when(currentUserService.requireCurrentUserId()).thenReturn(1L);
        when(analyticsService.byCategory(1L, AnalyticsPeriod.YEAR))
                .thenReturn(new AnalyticsByCategoryResponse(
                        "year",
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 12, 31),
                        BigDecimal.valueOf(120.00),
                        "USD",
                        List.of(new AnalyticsCategoryItemResponse(
                                "Entertainment",
                                BigDecimal.valueOf(59.99),
                                BigDecimal.valueOf(49.99),
                                2
                        ))
                ));

        mockMvc.perform(get("/api/v1/analytics/by-category").queryParam("period", "year"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("year"))
                .andExpect(jsonPath("$.from").exists())
                .andExpect(jsonPath("$.to").exists())
                .andExpect(jsonPath("$.totalAmount").value(120.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.items[0].category").value("Entertainment"))
                .andExpect(jsonPath("$.items[0].amount").value(59.99))
                .andExpect(jsonPath("$.items[0].sharePercent").value(49.99))
                .andExpect(jsonPath("$.items[0].subscriptionsCount").value(2));
    }

    @Test
    void analyticsForecastContract() throws Exception {
        when(currentUserService.requireCurrentUserId()).thenReturn(1L);
        when(analyticsService.forecast(1L))
                .thenReturn(new AnalyticsForecastResponse(
                        BigDecimal.valueOf(44.50),
                        BigDecimal.valueOf(534.00),
                        "USD"
                ));

        mockMvc.perform(get("/api/v1/analytics/forecast"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthForecast").value(44.50))
                .andExpect(jsonPath("$.yearForecast").value(534.00))
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    void analyticsInvalidPeriodErrorShapeContract() throws Exception {
        when(currentUserService.requireCurrentUserId()).thenReturn(1L);

        mockMvc.perform(get("/api/v1/analytics/summary").queryParam("period", "week"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("period must be one of: month, year"));
    }
}
