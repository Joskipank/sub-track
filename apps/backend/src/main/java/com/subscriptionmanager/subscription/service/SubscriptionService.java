package com.subscriptionmanager.subscription.service;

import com.subscriptionmanager.subscription.dto.SubscriptionRequest;
import com.subscriptionmanager.subscription.dto.SubscriptionResponse;

import java.util.List;

public interface SubscriptionService {
    List<SubscriptionResponse> list(Long userId);
    SubscriptionResponse create(Long userId, SubscriptionRequest request);
    SubscriptionResponse update(Long userId, Long id, SubscriptionRequest request);
    void delete(Long userId, Long id);
}
