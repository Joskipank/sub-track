package com.subscriptionmanager.forecast.controller;

import com.subscriptionmanager.forecast.dto.ForecastResponse;
import com.subscriptionmanager.forecast.service.ForecastService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/forecast")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @GetMapping
    public ForecastResponse forecast(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
                                     @RequestParam(defaultValue = "12") int months) {
        return forecastService.forecast(userId, months);
    }
}
