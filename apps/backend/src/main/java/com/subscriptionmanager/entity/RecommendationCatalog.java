package com.subscriptionmanager.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "recommendation_catalog")
public class RecommendationCatalog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String serviceName;

    @Column(nullable = false)
    private String alternativeService;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private Integer score;
}
