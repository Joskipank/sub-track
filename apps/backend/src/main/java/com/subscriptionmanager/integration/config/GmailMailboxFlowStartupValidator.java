package com.subscriptionmanager.integration.config;

import com.subscriptionmanager.importing.config.ImportProviderFeatureFlagsProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class GmailMailboxFlowStartupValidator {
    private final ImportProviderFeatureFlagsProperties featureFlags;
    private final GmailIntegrationProperties gmailProperties;
    private final String tokenEncryptionSecret;
    private final String oauthStateSecret;

    public GmailMailboxFlowStartupValidator(
            ImportProviderFeatureFlagsProperties featureFlags,
            GmailIntegrationProperties gmailProperties,
            @Value("${app.integrations.security.token-encryption-secret:${app.jwt.secret:}}") String tokenEncryptionSecret,
            @Value("${app.integrations.security.oauth-state-secret:${app.jwt.secret:}}") String oauthStateSecret
    ) {
        this.featureFlags = featureFlags;
        this.gmailProperties = gmailProperties;
        this.tokenEncryptionSecret = tokenEncryptionSecret;
        this.oauthStateSecret = oauthStateSecret;
    }

    @PostConstruct
    void validateConfiguration() {
        if (!featureFlags.getGmail().isMailboxEnabled()) {
            return;
        }

        List<String> missing = new ArrayList<>();
        if (!featureFlags.getGmail().isEnabled()) {
            missing.add("IMPORT_PROVIDERS_GMAIL_ENABLED=true");
        }
        if (isBlank(gmailProperties.getClientId())) {
            missing.add("GMAIL_CLIENT_ID");
        }
        if (isBlank(gmailProperties.getClientSecret())) {
            missing.add("GMAIL_CLIENT_SECRET");
        }
        if (isBlank(gmailProperties.getRedirectUri())) {
            missing.add("GMAIL_REDIRECT_URI");
        }
        if (isBlank(gmailProperties.getFrontendRedirectUri())) {
            missing.add("GMAIL_FRONTEND_REDIRECT_URI");
        }
        if (isBlank(tokenEncryptionSecret)) {
            missing.add("INTEGRATIONS_TOKEN_ENCRYPTION_SECRET");
        }
        if (isBlank(oauthStateSecret)) {
            missing.add("INTEGRATIONS_OAUTH_STATE_SECRET");
        }

        if (!missing.isEmpty()) {
            throw new IllegalStateException(
                    "Gmail mailbox flow is enabled, but required configuration is missing: " + String.join(", ", missing)
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
