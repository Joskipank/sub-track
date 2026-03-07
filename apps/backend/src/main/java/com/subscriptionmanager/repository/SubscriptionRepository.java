package com.subscriptionmanager.repository;

import com.subscriptionmanager.common.enums.SubscriptionStatus;
import com.subscriptionmanager.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
}
