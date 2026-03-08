package com.subscriptionmanager.repository;

import com.subscriptionmanager.common.enums.SubscriptionStatus;
import com.subscriptionmanager.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserIdOrderByNextBillingDateAsc(Long userId);
    List<Subscription> findByUserIdAndStatusAndNextBillingDateBetweenOrderByNextBillingDateAsc(
            Long userId,
            SubscriptionStatus status,
            LocalDate from,
            LocalDate to
    );
    Optional<Subscription> findByIdAndUserId(Long id, Long userId);
}
