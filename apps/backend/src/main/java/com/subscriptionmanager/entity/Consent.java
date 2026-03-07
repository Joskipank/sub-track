package com.subscriptionmanager.entity;

import com.subscriptionmanager.common.enums.ImportProvider;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "consents")
public class Consent {
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
    private String scope;

    @Column(nullable = false)
    private OffsetDateTime grantedAt;

    private OffsetDateTime revokedAt;
}
