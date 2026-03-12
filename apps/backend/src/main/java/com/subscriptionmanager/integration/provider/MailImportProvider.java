package com.subscriptionmanager.integration.provider;

import com.subscriptionmanager.entity.ImportJob;

public interface MailImportProvider {
    String providerCode();
    void importForJob(ImportJob job);
}
