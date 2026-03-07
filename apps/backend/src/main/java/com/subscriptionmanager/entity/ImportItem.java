package com.subscriptionmanager.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "import_items")
public class ImportItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private ImportJob job;

    @Column(nullable = false)
    private String externalId;

    @Column(columnDefinition = "TEXT")
    private String rawPayload;

    @Column(nullable = false)
    private OffsetDateTime createdAt;
}
