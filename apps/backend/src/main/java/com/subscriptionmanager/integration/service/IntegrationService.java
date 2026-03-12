package com.subscriptionmanager.integration.service;

import com.subscriptionmanager.integration.dto.IntegrationConnectionResponse;

import java.util.List;

public interface IntegrationService {
    List<IntegrationConnectionResponse> list(Long userId);
}
