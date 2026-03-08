package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserIdOrderByNextBillingDateAsc(Long userId);
    Optional<Subscription> findByIdAndUserId(Long id, Long userId);
}
