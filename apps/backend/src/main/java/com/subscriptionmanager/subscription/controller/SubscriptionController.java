package com.subscriptionmanager.subscription.controller;

import com.subscriptionmanager.subscription.dto.SubscriptionRequest;
import com.subscriptionmanager.subscription.dto.SubscriptionResponse;
import com.subscriptionmanager.subscription.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public List<SubscriptionResponse> list(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return subscriptionService.list(userId);
    }

    @PostMapping
    public SubscriptionResponse create(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
                                       @RequestBody SubscriptionRequest request) {
        return subscriptionService.create(userId, request);
    }

    @PutMapping("/{id}")
    public SubscriptionResponse update(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
                                       @PathVariable Long id,
                                       @RequestBody SubscriptionRequest request) {
        return subscriptionService.update(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
                       @PathVariable Long id) {
        subscriptionService.delete(userId, id);
    }
}
