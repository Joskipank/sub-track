package com.subscriptionmanager.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "subscription_events")
public class SubscriptionEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(nullable = false)
    private String eventType;

    @Column(precision = 12, scale = 2)
    private BigDecimal oldAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal newAmount;

    @Column(nullable = false)
    private OffsetDateTime createdAt;
}
