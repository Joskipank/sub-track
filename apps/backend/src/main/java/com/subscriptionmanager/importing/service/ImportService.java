package com.subscriptionmanager.importing.service;

import com.subscriptionmanager.common.enums.ImportProvider;
import com.subscriptionmanager.importing.dto.ImportJobResponse;

import java.util.List;

public interface ImportService {
    ImportJobResponse start(Long userId, ImportProvider provider);
    List<ImportJobResponse> history(Long userId);
}
