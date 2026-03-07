package com.subscriptionmanager.integration.controller;

import com.subscriptionmanager.integration.dto.IntegrationConnectionResponse;
import com.subscriptionmanager.integration.service.IntegrationService;
import com.subscriptionmanager.security.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/integrations")
public class IntegrationController {

    private final IntegrationService integrationService;
    private final CurrentUserService currentUserService;

    public IntegrationController(IntegrationService integrationService, CurrentUserService currentUserService) {
        this.integrationService = integrationService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<IntegrationConnectionResponse> list() {
        Long userId = currentUserService.requireCurrentUserId();
        return integrationService.list(userId);
    }
}
