package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.ImportJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportJobRepository extends JpaRepository<ImportJob, Long> {
    List<ImportJob> findByUserIdOrderByIdDesc(Long userId);
}
