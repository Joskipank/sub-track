package com.subscriptionmanager.notification.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {
    /*
     * MVP strategy: reminders are generated on-demand in NotificationService.list(...).
     * Scheduler is intentionally kept passive to avoid background race conditions in demo mode.
     */

    @Scheduled(cron = "0 0 8 * * *")
    public void scheduleUpcomingCharges() {
        // no-op by design in MVP
    }
}
