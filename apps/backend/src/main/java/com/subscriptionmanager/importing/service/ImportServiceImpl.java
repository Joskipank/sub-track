package com.subscriptionmanager.importing.service;

import com.subscriptionmanager.common.enums.ImportProvider;
import com.subscriptionmanager.importing.dto.ImportJobResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImportServiceImpl implements ImportService {
    @Override
    public ImportJobResponse start(Long userId, ImportProvider provider) {
        return new ImportJobResponse(null, provider.name(), "PENDING");
    }

    @Override
    public List<ImportJobResponse> history(Long userId) {
        return List.of();
    }
}
