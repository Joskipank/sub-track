package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.SubscriptionEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionEventRepository extends JpaRepository<SubscriptionEvent, Long> {
}
