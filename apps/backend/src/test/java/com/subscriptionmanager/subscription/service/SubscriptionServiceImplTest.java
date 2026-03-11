package com.subscriptionmanager.subscription.service;

import com.subscriptionmanager.common.enums.BillingPeriod;
import com.subscriptionmanager.common.enums.SourceType;
import com.subscriptionmanager.common.enums.SubscriptionStatus;
import com.subscriptionmanager.entity.Subscription;
import com.subscriptionmanager.exception.ApiException;
import com.subscriptionmanager.repository.CategoryRepository;
import com.subscriptionmanager.repository.SubscriptionRepository;
import com.subscriptionmanager.repository.UserRepository;
import com.subscriptionmanager.subscription.dto.UpcomingSubscriptionResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceImplTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Test
    void upcomingReturnsActiveSubscriptionsWithDaysUntilBilling() {
        SubscriptionServiceImpl service = new SubscriptionServiceImpl(subscriptionRepository, categoryRepository, userRepository);
        LocalDate today = LocalDate.now();
        LocalDate nextBillingDate = today.plusDays(2);

        Subscription subscription = new Subscription();
        subscription.setId(10L);
        subscription.setServiceName("Netflix");
        subscription.setAmount(BigDecimal.valueOf(9.99));
        subscription.setCurrency("USD");
        subscription.setBillingPeriod(BillingPeriod.MONTHLY);
        subscription.setNextBillingDate(nextBillingDate);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setSourceType(SourceType.MANUAL);

        when(subscriptionRepository.findByUserIdAndStatusAndNextBillingDateBetweenOrderByNextBillingDateAsc(
                1L,
                SubscriptionStatus.ACTIVE,
                today,
                today.plusDays(7)
        )).thenReturn(List.of(subscription));

        List<UpcomingSubscriptionResponse> response = service.upcoming(1L, 7);

        assertEquals(1, response.size());
        assertEquals("Netflix", response.getFirst().serviceName());
        assertEquals(2, response.getFirst().daysUntilBilling());
    }

    @Test
    void upcomingThrowsForInvalidDays() {
        SubscriptionServiceImpl service = new SubscriptionServiceImpl(subscriptionRepository, categoryRepository, userRepository);
        assertThrows(ApiException.class, () -> service.upcoming(1L, 0));
    }
}
