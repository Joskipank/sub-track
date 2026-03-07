package com.subscriptionmanager.notification.controller;

import com.subscriptionmanager.notification.dto.NotificationResponse;
import com.subscriptionmanager.notification.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> list(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return notificationService.list(userId);
    }
}
