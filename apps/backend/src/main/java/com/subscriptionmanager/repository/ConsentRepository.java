package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.Consent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsentRepository extends JpaRepository<Consent, Long> {
    List<Consent> findByUserId(Long userId);
}
