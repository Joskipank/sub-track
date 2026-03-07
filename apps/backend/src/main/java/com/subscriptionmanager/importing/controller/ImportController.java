package com.subscriptionmanager.importing.controller;

import com.subscriptionmanager.importing.dto.ImportJobResponse;
import com.subscriptionmanager.importing.dto.ImportStartRequest;
import com.subscriptionmanager.importing.service.ImportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/imports")
public class ImportController {

    private final ImportService importService;

    public ImportController(ImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/start")
    public ImportJobResponse start(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
                                   @RequestBody ImportStartRequest request) {
        return importService.start(userId, request.provider());
    }

    @GetMapping
    public List<ImportJobResponse> history(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return importService.history(userId);
    }
}
