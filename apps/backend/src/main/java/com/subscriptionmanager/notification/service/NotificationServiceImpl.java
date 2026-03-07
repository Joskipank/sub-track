package com.subscriptionmanager.notification.service;

import com.subscriptionmanager.notification.dto.NotificationResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    @Override
    public List<NotificationResponse> list(Long userId) {
        return List.of();
    }
}
