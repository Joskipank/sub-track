package com.subscriptionmanager.integration.service;

import com.subscriptionmanager.integration.dto.IntegrationConnectionResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IntegrationServiceImpl implements IntegrationService {
    @Override
    public List<IntegrationConnectionResponse> list(Long userId) {
        return List.of();
    }
}
