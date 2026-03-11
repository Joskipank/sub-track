package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.UsageSignal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsageSignalRepository extends JpaRepository<UsageSignal, Long> {
}
