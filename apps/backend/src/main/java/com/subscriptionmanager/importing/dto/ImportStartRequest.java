package com.subscriptionmanager.importing.dto;

import com.subscriptionmanager.common.enums.ImportProvider;

public record ImportStartRequest(ImportProvider provider) {
}
