package com.subscriptionmanager.consent.service;

import com.subscriptionmanager.consent.dto.ImportConsentStatusResponse;
import com.subscriptionmanager.entity.Consent;
import com.subscriptionmanager.entity.IntegrationConnection;
import com.subscriptionmanager.entity.User;
import com.subscriptionmanager.exception.ApiException;
import com.subscriptionmanager.repository.ConsentRepository;
import com.subscriptionmanager.repository.IntegrationConnectionRepository;
import com.subscriptionmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImportConsentServiceImplTest {

    @Mock
    private ConsentRepository consentRepository;
    @Mock
    private IntegrationConnectionRepository integrationConnectionRepository;
    @Mock
    private UserRepository userRepository;

    private ImportConsentServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ImportConsentServiceImpl(consentRepository, integrationConnectionRepository, userRepository);
    }

    @Test
    void grantCreatesActiveConsentAndIntegrationStatus() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(consentRepository.existsByUserIdAndProviderAndRevokedAtIsNull(1L, com.subscriptionmanager.common.enums.ImportProvider.GMAIL))
                .thenReturn(false);
        when(consentRepository.save(any(Consent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(consentRepository.findTopByUserIdAndProviderOrderByGrantedAtDesc(1L, com.subscriptionmanager.common.enums.ImportProvider.GMAIL))
                .thenAnswer(invocation -> {
                    Consent consent = new Consent();
                    consent.setProvider(com.subscriptionmanager.common.enums.ImportProvider.GMAIL);
                    consent.setScope("MAIL_IMPORT_READ");
                    consent.setGrantedAt(OffsetDateTime.now());
                    consent.setRevokedAt(null);
                    return Optional.of(consent);
                });
        IntegrationConnection activeIntegration = existingIntegration(user(1L));
        activeIntegration.setStatus("ACTIVE");
        when(integrationConnectionRepository.findTopByUserIdAndProviderOrderByUpdatedAtDesc(1L, com.subscriptionmanager.common.enums.ImportProvider.GMAIL))
                .thenReturn(Optional.empty(), Optional.of(activeIntegration));
        when(integrationConnectionRepository.save(any(IntegrationConnection.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ImportConsentStatusResponse response = service.grant(1L, "gmail");

        assertEquals("GMAIL", response.provider());
        assertEquals("GRANTED", response.status());
        assertEquals("MAIL_IMPORT_READ", response.scope());
        assertEquals("ACTIVE", response.integrationStatus());
    }

    @Test
    void revokeReturnsRevokedStatus() {
        Consent active = new Consent();
        active.setProvider(com.subscriptionmanager.common.enums.ImportProvider.GMAIL);
        active.setScope("MAIL_IMPORT_READ");
        active.setGrantedAt(OffsetDateTime.parse("2026-03-09T09:00:00Z"));
        active.setRevokedAt(null);

        when(consentRepository.findByUserIdAndProviderAndRevokedAtIsNull(1L, com.subscriptionmanager.common.enums.ImportProvider.GMAIL))
                .thenReturn(List.of(active));
        when(consentRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
        when(integrationConnectionRepository.findTopByUserIdAndProviderOrderByUpdatedAtDesc(1L, com.subscriptionmanager.common.enums.ImportProvider.GMAIL))
                .thenReturn(Optional.of(existingIntegration(user(1L))));
        when(integrationConnectionRepository.save(any(IntegrationConnection.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(consentRepository.findTopByUserIdAndProviderOrderByGrantedAtDesc(1L, com.subscriptionmanager.common.enums.ImportProvider.GMAIL))
                .thenAnswer(invocation -> Optional.of(active));

        ImportConsentStatusResponse response = service.revoke(1L, "GMAIL");

        assertEquals("REVOKED", response.status());
        assertEquals("REVOKED", response.integrationStatus());
    }

    @Test
    void statusReturnsNotGrantedWhenConsentMissing() {
        when(consentRepository.findTopByUserIdAndProviderOrderByGrantedAtDesc(1L, com.subscriptionmanager.common.enums.ImportProvider.GMAIL))
                .thenReturn(Optional.empty());
        when(integrationConnectionRepository.findTopByUserIdAndProviderOrderByUpdatedAtDesc(1L, com.subscriptionmanager.common.enums.ImportProvider.GMAIL))
                .thenReturn(Optional.empty());

        ImportConsentStatusResponse response = service.status(1L, "GMAIL");

        assertEquals("NOT_GRANTED", response.status());
        assertEquals("NOT_CONNECTED", response.integrationStatus());
    }

    @Test
    void unsupportedProviderThrowsBadRequest() {
        ApiException exception = assertThrows(ApiException.class, () -> service.status(1L, "YANDEX"));
        assertEquals("provider must be one of: GMAIL", exception.getMessage());
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    private IntegrationConnection existingIntegration(User user) {
        IntegrationConnection connection = new IntegrationConnection();
        connection.setUser(user);
        connection.setProvider(com.subscriptionmanager.common.enums.ImportProvider.GMAIL);
        connection.setStatus("ACTIVE");
        connection.setCreatedAt(OffsetDateTime.now());
        connection.setUpdatedAt(OffsetDateTime.now());
        return connection;
    }
}
