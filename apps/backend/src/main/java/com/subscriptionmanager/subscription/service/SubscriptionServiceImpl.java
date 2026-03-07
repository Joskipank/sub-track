package com.subscriptionmanager.subscription.service;

import com.subscriptionmanager.subscription.dto.SubscriptionRequest;
import com.subscriptionmanager.subscription.dto.SubscriptionResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {
    @Override
    public List<SubscriptionResponse> list(Long userId) {
        return List.of();
    }

    @Override
    public SubscriptionResponse create(Long userId, SubscriptionRequest request) {
        return null;
    }

    @Override
    public SubscriptionResponse update(Long userId, Long id, SubscriptionRequest request) {
        return null;
    }

    @Override
    public void delete(Long userId, Long id) {
    }
}
