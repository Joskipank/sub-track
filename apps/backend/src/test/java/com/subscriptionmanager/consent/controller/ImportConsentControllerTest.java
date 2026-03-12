package com.subscriptionmanager.consent.controller;

import com.subscriptionmanager.consent.dto.ImportConsentStatusResponse;
import com.subscriptionmanager.consent.service.ImportConsentService;
import com.subscriptionmanager.exception.GlobalExceptionHandler;
import com.subscriptionmanager.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.OffsetDateTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ImportConsentControllerTest {

    private ImportConsentService importConsentService;
    private CurrentUserService currentUserService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        importConsentService = Mockito.mock(ImportConsentService.class);
        currentUserService = Mockito.mock(CurrentUserService.class);

        ImportConsentController controller = new ImportConsentController(importConsentService, currentUserService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void statusReturnsConsentState() throws Exception {
        when(currentUserService.requireCurrentUserId()).thenReturn(1L);
        when(importConsentService.status(1L, "GMAIL"))
                .thenReturn(new ImportConsentStatusResponse(
                        "GMAIL",
                        "NOT_GRANTED",
                        "MAIL_IMPORT_READ",
                        null,
                        null,
                        "NOT_CONNECTED"
                ));

        mockMvc.perform(get("/api/v1/consents/imports/GMAIL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value("GMAIL"))
                .andExpect(jsonPath("$.status").value("NOT_GRANTED"));
    }

    @Test
    void grantReturnsGrantedStatus() throws Exception {
        when(currentUserService.requireCurrentUserId()).thenReturn(1L);
        when(importConsentService.grant(1L, "GMAIL"))
                .thenReturn(new ImportConsentStatusResponse(
                        "GMAIL",
                        "GRANTED",
                        "MAIL_IMPORT_READ",
                        OffsetDateTime.parse("2026-03-09T10:00:00Z"),
                        null,
                        "ACTIVE"
                ));

        mockMvc.perform(post("/api/v1/consents/imports/GMAIL/grant"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("GRANTED"))
                .andExpect(jsonPath("$.integrationStatus").value("ACTIVE"));
    }

    @Test
    void revokeReturnsRevokedStatus() throws Exception {
        when(currentUserService.requireCurrentUserId()).thenReturn(1L);
        when(importConsentService.revoke(1L, "GMAIL"))
                .thenReturn(new ImportConsentStatusResponse(
                        "GMAIL",
                        "REVOKED",
                        "MAIL_IMPORT_READ",
                        OffsetDateTime.parse("2026-03-09T10:00:00Z"),
                        OffsetDateTime.parse("2026-03-09T11:00:00Z"),
                        "REVOKED"
                ));

        mockMvc.perform(post("/api/v1/consents/imports/GMAIL/revoke"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REVOKED"))
                .andExpect(jsonPath("$.integrationStatus").value("REVOKED"));
    }
}
