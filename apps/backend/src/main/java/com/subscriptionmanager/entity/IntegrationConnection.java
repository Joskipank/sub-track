package com.subscriptionmanager.entity;

import com.subscriptionmanager.common.enums.ImportProvider;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "integrations")
public class IntegrationConnection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImportProvider provider;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String encryptedAccessToken;

    @Column(columnDefinition = "TEXT")
    private String encryptedRefreshToken;

    private OffsetDateTime tokenExpiresAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;
}
