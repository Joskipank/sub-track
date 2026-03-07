package com.subscriptionmanager.repository;

import com.subscriptionmanager.entity.RecommendationCatalog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationCatalogRepository extends JpaRepository<RecommendationCatalog, Long> {
    List<RecommendationCatalog> findByCategoryNameIgnoreCase(String categoryName);
}
