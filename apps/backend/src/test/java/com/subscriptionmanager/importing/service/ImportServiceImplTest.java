package com.subscriptionmanager.importing.service;

import com.subscriptionmanager.common.enums.BillingPeriod;
import com.subscriptionmanager.common.enums.ImportProvider;
import com.subscriptionmanager.entity.ImportJob;
import com.subscriptionmanager.entity.User;
import com.subscriptionmanager.importing.dto.ImportHistoryItemResponse;
import com.subscriptionmanager.importing.dto.ImportResultResponse;
import com.subscriptionmanager.importing.dto.ImportStartRequest;
import com.subscriptionmanager.importing.dto.MailMessageRequest;
import com.subscriptionmanager.importing.parser.GmailNetflixParser;
import com.subscriptionmanager.repository.CategoryRepository;
import com.subscriptionmanager.repository.ImportItemRepository;
import com.subscriptionmanager.repository.ImportJobRepository;
import com.subscriptionmanager.repository.SubscriptionRepository;
import com.subscriptionmanager.repository.UserRepository;
import com.subscriptionmanager.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImportServiceImplTest {

    @Mock
    private ImportJobRepository importJobRepository;
    @Mock
    private ImportItemRepository importItemRepository;
    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private GmailNetflixParser gmailNetflixParser;

    private ImportServiceImpl importService;

    @BeforeEach
    void setUp() {
        importService = new ImportServiceImpl(
                importJobRepository,
                importItemRepository,
                subscriptionRepository,
                categoryRepository,
                userRepository,
                gmailNetflixParser
        );

        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        lenient().when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        lenient().when(importJobRepository.save(any(ImportJob.class))).thenAnswer(invocation -> {
            ImportJob job = invocation.getArgument(0);
            if (job.getId() == null) {
                job.setId(100L);
            }
            return job;
        });
    }

    @Test
    void startCreatesSubscriptionForValidGmailMessage() {
        MailMessageRequest message = message("ext-1");
        ImportStartRequest request = new ImportStartRequest(ImportProvider.GMAIL, List.of(message));

        when(importItemRepository.existsByJobUserIdAndExternalId(1L, "ext-1")).thenReturn(false);
        when(gmailNetflixParser.parse(message)).thenReturn(
                GmailNetflixParser.ParseResult.success(
                        new GmailNetflixParser.ParsedSubscription(
                                "Netflix",
                                BigDecimal.valueOf(9.99),
                                "USD",
                                BillingPeriod.MONTHLY,
                                LocalDate.of(2026, 3, 20),
                                "Entertainment"
                        )
                )
        );
        when(subscriptionRepository.existsByUserIdAndServiceNameIgnoreCaseAndAmountAndCurrencyAndBillingPeriodAndNextBillingDateAndStatus(
                anyLong(), anyString(), any(), anyString(), any(), any(), any()
        )).thenReturn(false);

        ImportResultResponse response = importService.start(1L, request);

        assertEquals(1, response.created());
        assertEquals(0, response.skipped());
        assertEquals(0, response.errors());
        assertEquals("COMPLETED", response.status());
    }

    @Test
    void startSkipsDuplicateExternalId() {
        MailMessageRequest message = message("ext-dup");
        ImportStartRequest request = new ImportStartRequest(ImportProvider.GMAIL, List.of(message));

        when(importItemRepository.existsByJobUserIdAndExternalId(1L, "ext-dup")).thenReturn(true);

        ImportResultResponse response = importService.start(1L, request);

        assertEquals(0, response.created());
        assertEquals(1, response.skipped());
        assertEquals(0, response.errors());
        assertEquals("COMPLETED", response.status());
    }

    @Test
    void startFailsOnBrokenMessage() {
        MailMessageRequest message = message("ext-broken");
        ImportStartRequest request = new ImportStartRequest(ImportProvider.GMAIL, List.of(message));

        when(importItemRepository.existsByJobUserIdAndExternalId(1L, "ext-broken")).thenReturn(false);
        when(gmailNetflixParser.parse(message)).thenReturn(
                GmailNetflixParser.ParseResult.error("parser could not extract valid amount")
        );

        ImportResultResponse response = importService.start(1L, request);

        assertEquals(0, response.created());
        assertEquals(0, response.skipped());
        assertEquals(1, response.errors());
        assertEquals("FAILED", response.status());
    }

    @Test
    void startSkipsDuplicateSubscriptionOnRepeatedImport() {
        MailMessageRequest message = message("ext-repeat");
        ImportStartRequest request = new ImportStartRequest(ImportProvider.GMAIL, List.of(message));

        when(importItemRepository.existsByJobUserIdAndExternalId(1L, "ext-repeat")).thenReturn(false);
        when(gmailNetflixParser.parse(message)).thenReturn(
                GmailNetflixParser.ParseResult.success(
                        new GmailNetflixParser.ParsedSubscription(
                                "Netflix",
                                BigDecimal.valueOf(9.99),
                                "USD",
                                BillingPeriod.MONTHLY,
                                LocalDate.of(2026, 3, 20),
                                "Entertainment"
                        )
                )
        );
        when(subscriptionRepository.existsByUserIdAndServiceNameIgnoreCaseAndAmountAndCurrencyAndBillingPeriodAndNextBillingDateAndStatus(
                anyLong(), anyString(), any(), anyString(), any(), any(), any()
        )).thenReturn(true);

        ImportResultResponse response = importService.start(1L, request);

        assertEquals(0, response.created());
        assertEquals(1, response.skipped());
        assertEquals(0, response.errors());
    }

    @Test
    void historyReturnsSavedImportJobs() {
        ImportJob job = new ImportJob();
        job.setId(77L);
        job.setProvider(ImportProvider.GMAIL);
        job.setStatus("COMPLETED");
        job.setStartedAt(OffsetDateTime.parse("2026-03-08T10:00:00Z"));
        job.setFinishedAt(OffsetDateTime.parse("2026-03-08T10:01:00Z"));

        when(importJobRepository.findByUserIdOrderByIdDesc(1L)).thenReturn(List.of(job));

        List<ImportHistoryItemResponse> history = importService.history(1L);

        assertEquals(1, history.size());
        assertEquals(77L, history.getFirst().id());
        assertEquals("GMAIL", history.getFirst().provider());
    }

    @Test
    void startThrowsForProviderOtherThanGmail() {
        MailMessageRequest message = message("ext-3");
        ImportStartRequest request = new ImportStartRequest(ImportProvider.YANDEX, List.of(message));

        assertThrows(ApiException.class, () -> importService.start(1L, request));
    }

    @Test
    void startRepeatedImportWithSamePayloadIsIdempotentByExternalId() {
        MailMessageRequest message = message("ext-replay");
        ImportStartRequest request = new ImportStartRequest(ImportProvider.GMAIL, List.of(message));

        when(importItemRepository.existsByJobUserIdAndExternalId(1L, "ext-replay"))
                .thenReturn(false, true);
        when(gmailNetflixParser.parse(message)).thenReturn(
                GmailNetflixParser.ParseResult.success(
                        new GmailNetflixParser.ParsedSubscription(
                                "Netflix",
                                BigDecimal.valueOf(9.99),
                                "USD",
                                BillingPeriod.MONTHLY,
                                LocalDate.of(2026, 3, 20),
                                "Entertainment"
                        )
                )
        );
        when(subscriptionRepository.existsByUserIdAndServiceNameIgnoreCaseAndAmountAndCurrencyAndBillingPeriodAndNextBillingDateAndStatus(
                anyLong(), anyString(), any(), anyString(), any(), any(), any()
        )).thenReturn(false);

        ImportResultResponse first = importService.start(1L, request);
        ImportResultResponse second = importService.start(1L, request);

        assertEquals(1, first.created());
        assertEquals(0, first.skipped());
        assertEquals(0, first.errors());
        assertEquals("COMPLETED", first.status());

        assertEquals(0, second.created());
        assertEquals(1, second.skipped());
        assertEquals(0, second.errors());
        assertEquals("COMPLETED", second.status());
    }

    @Test
    void startThrowsWhenMessagesListIsEmpty() {
        ImportStartRequest request = new ImportStartRequest(ImportProvider.GMAIL, List.of());

        ApiException exception = assertThrows(ApiException.class, () -> importService.start(1L, request));

        assertEquals("messages must contain at least one message", exception.getMessage());
    }

    private MailMessageRequest message(String externalId) {
        return new MailMessageRequest(
                externalId,
                "billing@netflix.com",
                "Netflix renewal",
                "Your Netflix renewal is scheduled for 2026-03-20. Amount: 9.99 USD",
                OffsetDateTime.now()
        );
    }
}
