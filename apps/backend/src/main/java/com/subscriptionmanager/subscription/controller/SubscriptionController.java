package com.subscriptionmanager.subscription.controller;

import com.subscriptionmanager.security.CurrentUserService;
import com.subscriptionmanager.subscription.dto.SubscriptionRequest;
import com.subscriptionmanager.subscription.dto.SubscriptionResponse;
import com.subscriptionmanager.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final CurrentUserService currentUserService;

    public SubscriptionController(SubscriptionService subscriptionService, CurrentUserService currentUserService) {
        this.subscriptionService = subscriptionService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<SubscriptionResponse> list() {
        Long userId = currentUserService.requireCurrentUserId();
        return subscriptionService.list(userId);
    }

    @GetMapping("/{id}")
    public SubscriptionResponse getById(@PathVariable Long id) {
        Long userId = currentUserService.requireCurrentUserId();
        return subscriptionService.getById(userId, id);
    }

    @PostMapping
    public SubscriptionResponse create(@Valid @RequestBody SubscriptionRequest request) {
        Long userId = currentUserService.requireCurrentUserId();
        return subscriptionService.create(userId, request);
    }

    @PutMapping("/{id}")
    public SubscriptionResponse update(@PathVariable Long id, @Valid @RequestBody SubscriptionRequest request) {
        Long userId = currentUserService.requireCurrentUserId();
        return subscriptionService.update(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Long userId = currentUserService.requireCurrentUserId();
        subscriptionService.delete(userId, id);
    }
}
