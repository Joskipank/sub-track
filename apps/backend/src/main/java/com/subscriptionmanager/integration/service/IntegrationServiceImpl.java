package com.subscriptionmanager.integration.service;

import com.subscriptionmanager.integration.dto.IntegrationConnectionResponse;
import com.subscriptionmanager.repository.IntegrationConnectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IntegrationServiceImpl implements IntegrationService {

    private final IntegrationConnectionRepository integrationConnectionRepository;

    public IntegrationServiceImpl(IntegrationConnectionRepository integrationConnectionRepository) {
        this.integrationConnectionRepository = integrationConnectionRepository;
    }

    @Override
    public List<IntegrationConnectionResponse> list(Long userId) {
        return integrationConnectionRepository.findByUserId(userId)
                .stream()
                .map(connection -> new IntegrationConnectionResponse(
                        connection.getId(),
                        connection.getProvider().name(),
                        connection.getStatus()
                ))
                .toList();
    }
}
