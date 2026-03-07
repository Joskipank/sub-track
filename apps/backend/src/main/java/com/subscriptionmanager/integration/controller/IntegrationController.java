package com.subscriptionmanager.integration.controller;

import com.subscriptionmanager.integration.dto.IntegrationConnectionResponse;
import com.subscriptionmanager.integration.service.IntegrationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/integrations")
public class IntegrationController {

    private final IntegrationService integrationService;

    public IntegrationController(IntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    @GetMapping
    public List<IntegrationConnectionResponse> list(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return integrationService.list(userId);
    }
}
