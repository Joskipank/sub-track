package com.subscriptionmanager.notification.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {

    @Scheduled(cron = "0 0 8 * * *")
    public void scheduleUpcomingCharges() {
        // TODO enqueue notifications for 1-3 days before billing date.
    }
}
