package com.subscriptionmanager.importing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

public record MailMessageRequest(
        @NotBlank
        @Size(max = 255)
        String externalId,
        @NotBlank
        @Size(max = 255)
        String from,
        @NotBlank
        @Size(max = 500)
        String subject,
        @NotBlank
        String body,
        @NotNull
        OffsetDateTime receivedAt
) {
}
