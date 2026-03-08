package com.subscriptionmanager.importing.dto;

import com.subscriptionmanager.common.enums.ImportProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ImportStartRequest(
        @NotNull
        ImportProvider provider,
        @NotEmpty
        List<@Valid MailMessageRequest> messages
) {
}
