package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.UsageSignal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsageSignalRepository extends JpaRepository<UsageSignal, Long> {
    List<UsageSignal> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UsageSignal> findByUserIdAndSubscriptionIdOrderByCreatedAtDesc(Long userId, Long subscriptionId);
}
