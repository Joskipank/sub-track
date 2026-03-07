package com.subscriptionmanager.recommendation.controller;

import com.subscriptionmanager.recommendation.dto.RecommendationResponse;
import com.subscriptionmanager.recommendation.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public List<RecommendationResponse> list(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
                                             @RequestParam String category) {
        return recommendationService.byCategory(userId, category);
    }
}
