package com.subscriptionmanager.entity;

import com.subscriptionmanager.common.enums.NotificationType;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private OffsetDateTime scheduledAt;

    private OffsetDateTime sentAt;

    @Column(nullable = false)
    private String status;
}
