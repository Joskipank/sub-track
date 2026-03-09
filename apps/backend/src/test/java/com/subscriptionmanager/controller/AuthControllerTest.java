package com.subscriptionmanager.controller;

import com.subscriptionmanager.dto.AuthResponse;
import com.subscriptionmanager.dto.LoginRequest;
import com.subscriptionmanager.dto.RegisterRequest;
import com.subscriptionmanager.dto.UserResponse;
import com.subscriptionmanager.exception.GlobalExceptionHandler;
import com.subscriptionmanager.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private AuthService authService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        authService = Mockito.mock(AuthService.class);
        AuthController controller = new AuthController(authService);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void registerReturnsCreated() throws Exception {
        String body = """
                {
                  "email": "new@subtrack.app",
                  "password": "Passw0rd!"
                }
                """;

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(sampleAuthResponse("new@subtrack.app"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.email").value("new@subtrack.app"));
    }

    @Test
    void loginReturnsOk() throws Exception {
        String body = """
                {
                  "email": "demo@subtrack.app",
                  "password": "Passw0rd!"
                }
                """;

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(sampleAuthResponse("demo@subtrack.app"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.email").value("demo@subtrack.app"));
    }

    @Test
    void registerReturnsBadRequestForValidationErrors() throws Exception {
        String body = """
                {
                  "email": "not-an-email",
                  "password": ""
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void loginReturnsUnauthorizedForInvalidCredentials() throws Exception {
        String body = """
                {
                  "email": "demo@subtrack.app",
                  "password": "wrong-pass"
                }
                """;

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    private AuthResponse sampleAuthResponse(String email) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(1L);
        userResponse.setEmail(email);

        return new AuthResponse("jwt-token", userResponse);
    }
}
