package com.subscriptionmanager.integration.provider;

import com.subscriptionmanager.entity.ImportJob;

public interface BankImportProvider {
    String providerCode();
    void importForJob(ImportJob job);
}
