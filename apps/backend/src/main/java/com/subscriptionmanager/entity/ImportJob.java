package com.subscriptionmanager.entity;

import com.subscriptionmanager.common.enums.ImportProvider;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "import_jobs")
public class ImportJob {
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

    private OffsetDateTime startedAt;

    private OffsetDateTime finishedAt;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
