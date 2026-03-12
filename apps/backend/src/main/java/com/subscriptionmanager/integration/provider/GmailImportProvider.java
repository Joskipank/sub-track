package com.subscriptionmanager.integration.provider;

import com.subscriptionmanager.entity.ImportJob;
import org.springframework.stereotype.Component;

@Component
public class GmailImportProvider implements MailImportProvider {
    @Override
    public String providerCode() {
        return "GMAIL";
    }

    @Override
    public void importForJob(ImportJob job) {
        // TODO implement OAuth + receipt parsing flow.
    }
}
