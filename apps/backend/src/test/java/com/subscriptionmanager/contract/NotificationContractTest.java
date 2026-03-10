package com.subscriptionmanager.contract;

import com.subscriptionmanager.exception.GlobalExceptionHandler;
import com.subscriptionmanager.notification.controller.NotificationController;
import com.subscriptionmanager.notification.dto.NotificationResponse;
import com.subscriptionmanager.notification.service.NotificationService;
import com.subscriptionmanager.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NotificationContractTest {

    private NotificationService notificationService;
    private CurrentUserService currentUserService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        notificationService = Mockito.mock(NotificationService.class);
        currentUserService = Mockito.mock(CurrentUserService.class);

        NotificationController controller = new NotificationController(notificationService, currentUserService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void notificationsContract() throws Exception {
        when(currentUserService.requireCurrentUserId()).thenReturn(1L);
        when(notificationService.list(1L, 7))
                .thenReturn(List.of(new NotificationResponse(
                        10L,
                        "BILLING_REMINDER",
                        "Netflix will renew in 2 days",
                        "2026-03-18T09:00:00Z",
                        "PENDING"
                )));

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].type").value("BILLING_REMINDER"))
                .andExpect(jsonPath("$[0].message").value("Netflix will renew in 2 days"))
                .andExpect(jsonPath("$[0].scheduledAt").value("2026-03-18T09:00:00Z"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));

        verify(notificationService).list(1L, 7);
    }
}
