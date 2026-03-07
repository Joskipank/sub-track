package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.IntegrationConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IntegrationConnectionRepository extends JpaRepository<IntegrationConnection, Long> {
    List<IntegrationConnection> findByUserId(Long userId);
}
