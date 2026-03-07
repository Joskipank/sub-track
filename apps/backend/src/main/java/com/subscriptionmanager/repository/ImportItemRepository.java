package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.ImportItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportItemRepository extends JpaRepository<ImportItem, Long> {
}
