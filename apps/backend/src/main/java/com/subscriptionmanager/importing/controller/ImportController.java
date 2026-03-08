package com.subscriptionmanager.importing.controller;

import com.subscriptionmanager.importing.dto.ImportJobResponse;
import com.subscriptionmanager.importing.dto.ImportStartRequest;
import com.subscriptionmanager.importing.service.ImportService;
import com.subscriptionmanager.security.CurrentUserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/imports")
public class ImportController {

    private final ImportService importService;
    private final CurrentUserService currentUserService;

    public ImportController(ImportService importService, CurrentUserService currentUserService) {
        this.importService = importService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/start")
    public ImportJobResponse start(@RequestBody ImportStartRequest request) {
        Long userId = currentUserService.requireCurrentUserId();
        return importService.start(userId, request.provider());
    }

    @GetMapping
    public List<ImportJobResponse> history() {
        Long userId = currentUserService.requireCurrentUserId();
        return importService.history(userId);
    }
}
