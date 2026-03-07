package com.subscriptionmanager.forecast.service;

import com.subscriptionmanager.forecast.dto.ForecastResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ForecastServiceImpl implements ForecastService {
    @Override
    public ForecastResponse forecast(Long userId, int months) {
        return new ForecastResponse(BigDecimal.ZERO, BigDecimal.ZERO);
    }
}
