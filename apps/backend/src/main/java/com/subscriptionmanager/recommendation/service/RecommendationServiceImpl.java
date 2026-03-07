package com.subscriptionmanager.recommendation.service;

import com.subscriptionmanager.recommendation.dto.RecommendationResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationServiceImpl implements RecommendationService {
    @Override
    public List<RecommendationResponse> byCategory(Long userId, String category) {
        return List.of();
    }
}
