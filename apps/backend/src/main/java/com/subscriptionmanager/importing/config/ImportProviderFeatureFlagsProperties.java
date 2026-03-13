package com.subscriptionmanager.importing.config;

import com.subscriptionmanager.common.enums.ImportProvider;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "import.providers")
public class ImportProviderFeatureFlagsProperties {

    private ProviderToggle gmail = new ProviderToggle(true);
    private ProviderToggle yandex = new ProviderToggle(false);
    private ProviderToggle mailRu = new ProviderToggle(false);
    private ProviderToggle bankApi = new ProviderToggle(false);

    public ProviderToggle getGmail() {
        return gmail;
    }

    public void setGmail(ProviderToggle gmail) {
        this.gmail = gmail;
    }

    public ProviderToggle getYandex() {
        return yandex;
    }

    public void setYandex(ProviderToggle yandex) {
        this.yandex = yandex;
    }

    public ProviderToggle getMailRu() {
        return mailRu;
    }

    public void setMailRu(ProviderToggle mailRu) {
        this.mailRu = mailRu;
    }

    public ProviderToggle getBankApi() {
        return bankApi;
    }

    public void setBankApi(ProviderToggle bankApi) {
        this.bankApi = bankApi;
    }

    public boolean isEnabled(ImportProvider provider) {
        return switch (provider) {
            case GMAIL -> gmail.isEnabled();
            case YANDEX -> yandex.isEnabled();
            case MAIL_RU -> mailRu.isEnabled();
            case BANK_API -> bankApi.isEnabled();
        };
    }

    public boolean isOnlyGmailEnabled() {
        return gmail.isEnabled()
                && !yandex.isEnabled()
                && !mailRu.isEnabled()
                && !bankApi.isEnabled();
    }

    public static class ProviderToggle {
        private boolean enabled;

        public ProviderToggle() {
        }

        public ProviderToggle(boolean enabled) {
            this.enabled = enabled;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}
