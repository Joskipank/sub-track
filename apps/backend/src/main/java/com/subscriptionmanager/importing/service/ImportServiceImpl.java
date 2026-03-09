package com.subscriptionmanager.importing.service;

import com.subscriptionmanager.common.enums.ImportProvider;
import com.subscriptionmanager.common.enums.SourceType;
import com.subscriptionmanager.common.enums.SubscriptionStatus;
import com.subscriptionmanager.entity.Category;
import com.subscriptionmanager.entity.ImportItem;
import com.subscriptionmanager.entity.ImportJob;
import com.subscriptionmanager.entity.Subscription;
import com.subscriptionmanager.entity.User;
import com.subscriptionmanager.exception.ApiException;
import com.subscriptionmanager.importing.ImportItemStatus;
import com.subscriptionmanager.importing.ImportJobStatus;
import com.subscriptionmanager.importing.dto.ImportErrorItemResponse;
import com.subscriptionmanager.importing.dto.ImportHistoryItemResponse;
import com.subscriptionmanager.importing.dto.ImportResultResponse;
import com.subscriptionmanager.importing.dto.ImportStartRequest;
import com.subscriptionmanager.importing.dto.MailMessageRequest;
import com.subscriptionmanager.importing.exception.ImportConsentRequiredException;
import com.subscriptionmanager.importing.parser.GmailNetflixParser;
import com.subscriptionmanager.repository.CategoryRepository;
import com.subscriptionmanager.repository.ConsentRepository;
import com.subscriptionmanager.repository.ImportItemRepository;
import com.subscriptionmanager.repository.ImportJobRepository;
import com.subscriptionmanager.repository.SubscriptionRepository;
import com.subscriptionmanager.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class ImportServiceImpl implements ImportService {
    private static final String META_SEPARATOR = "|";
    private static final String STATUS_KEY = "STATUS=";
    private static final String REASON_KEY = "REASON=";

    private final ImportJobRepository importJobRepository;
    private final ImportItemRepository importItemRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CategoryRepository categoryRepository;
    private final ConsentRepository consentRepository;
    private final UserRepository userRepository;
    private final GmailNetflixParser gmailNetflixParser;

    public ImportServiceImpl(
            ImportJobRepository importJobRepository,
            ImportItemRepository importItemRepository,
            SubscriptionRepository subscriptionRepository,
            CategoryRepository categoryRepository,
            ConsentRepository consentRepository,
            UserRepository userRepository,
            GmailNetflixParser gmailNetflixParser
    ) {
        this.importJobRepository = importJobRepository;
        this.importItemRepository = importItemRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.categoryRepository = categoryRepository;
        this.consentRepository = consentRepository;
        this.userRepository = userRepository;
        this.gmailNetflixParser = gmailNetflixParser;
    }

    @Override
    @Transactional
    public ImportResultResponse start(Long userId, ImportStartRequest request) {
        if (request == null) {
            throw new ApiException("request is required");
        }
        validateProvider(request.provider());
        ensureActiveConsent(userId, request.provider());
        if (request.messages() == null || request.messages().isEmpty()) {
            throw new ApiException("messages must contain at least one message");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        ImportJob job = new ImportJob();
        job.setUser(user);
        job.setProvider(request.provider());
        job.setStatus(ImportJobStatus.IN_PROGRESS.name());
        job.setStartedAt(OffsetDateTime.now());
        job.setErrorMessage(null);
        job = importJobRepository.save(job);

        int created = 0;
        int skipped = 0;
        int errors = 0;
        List<ImportErrorItemResponse> errorItems = new ArrayList<>();

        for (MailMessageRequest message : request.messages()) {
            String externalId = normalizeExternalId(message.externalId());
            if (externalId == null) {
                errors++;
                errorItems.add(new ImportErrorItemResponse(message.externalId(), "externalId is blank"));
                saveImportItem(job, message.externalId(), ImportItemStatus.ERROR, "externalId is blank", message);
                continue;
            }

            if (importItemRepository.existsByJobUserIdAndExternalId(userId, externalId)) {
                skipped++;
                saveImportItem(job, externalId, ImportItemStatus.SKIPPED, "duplicate externalId", message);
                continue;
            }

            GmailNetflixParser.ParseResult parseResult = gmailNetflixParser.parse(message);
            if (!parseResult.success()) {
                errors++;
                errorItems.add(new ImportErrorItemResponse(externalId, parseResult.reason()));
                saveImportItem(job, externalId, ImportItemStatus.ERROR, parseResult.reason(), message);
                continue;
            }

            GmailNetflixParser.ParsedSubscription parsed = parseResult.parsedSubscription();
            boolean duplicateSubscription = subscriptionRepository
                    .existsByUserIdAndServiceNameIgnoreCaseAndAmountAndCurrencyAndBillingPeriodAndNextBillingDateAndStatus(
                            userId,
                            parsed.serviceName(),
                            parsed.amount(),
                            parsed.currency(),
                            parsed.billingPeriod(),
                            parsed.nextBillingDate(),
                            SubscriptionStatus.ACTIVE
                    );

            if (duplicateSubscription) {
                skipped++;
                saveImportItem(job, externalId, ImportItemStatus.SKIPPED, "duplicate subscription", message);
                continue;
            }

            Subscription subscription = new Subscription();
            subscription.setUser(user);
            subscription.setServiceName(parsed.serviceName());
            subscription.setAmount(parsed.amount());
            subscription.setCurrency(parsed.currency().toUpperCase(Locale.ROOT));
            subscription.setBillingPeriod(parsed.billingPeriod());
            subscription.setNextBillingDate(parsed.nextBillingDate());
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setSourceType(SourceType.MAIL_IMPORT);

            Optional<Category> categoryOptional = categoryRepository.findByNameIgnoreCase(parsed.categoryName());
            subscription.setCategory(categoryOptional.orElse(null));
            subscriptionRepository.save(subscription);

            created++;
            saveImportItem(job, externalId, ImportItemStatus.CREATED, null, message);
        }

        int processed = request.messages().size();
        job.setFinishedAt(OffsetDateTime.now());
        job.setStatus(resolveFinalStatus(processed, created, errors));
        job.setErrorMessage(errorItems.isEmpty() ? null : errorItemsToString(errorItems));
        job = importJobRepository.save(job);

        return new ImportResultResponse(
                job.getId(),
                job.getProvider().name(),
                job.getStatus(),
                processed,
                created,
                skipped,
                errors,
                job.getStartedAt(),
                job.getFinishedAt(),
                errorItems
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImportHistoryItemResponse> history(Long userId) {
        return importJobRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(job -> new ImportHistoryItemResponse(
                        job.getId(),
                        job.getProvider().name(),
                        job.getStatus(),
                        job.getStartedAt(),
                        job.getFinishedAt()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ImportResultResponse getById(Long userId, Long jobId) {
        ImportJob job = importJobRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ApiException("Import job not found"));

        List<ImportItem> items = importItemRepository.findByJobId(job.getId());
        int created = 0;
        int skipped = 0;
        int errors = 0;
        List<ImportErrorItemResponse> errorItems = new ArrayList<>();

        for (ImportItem item : items) {
            ImportItemStatus status = extractStatus(item.getRawPayload());
            String reason = extractReason(item.getRawPayload());

            if (status == ImportItemStatus.CREATED) {
                created++;
            } else if (status == ImportItemStatus.SKIPPED) {
                skipped++;
            } else {
                errors++;
                errorItems.add(new ImportErrorItemResponse(item.getExternalId(), reason == null ? "unknown parser/import error" : reason));
            }
        }

        return new ImportResultResponse(
                job.getId(),
                job.getProvider().name(),
                job.getStatus(),
                items.size(),
                created,
                skipped,
                errors,
                job.getStartedAt(),
                job.getFinishedAt(),
                errorItems
        );
    }

    private void validateProvider(ImportProvider provider) {
        if (provider == null) {
            throw new ApiException("provider is required");
        }

        if (provider != ImportProvider.GMAIL) {
            throw new ApiException("only GMAIL provider is supported in MVP");
        }
    }

    private void ensureActiveConsent(Long userId, ImportProvider provider) {
        boolean hasActiveConsent = consentRepository.existsByUserIdAndProviderAndRevokedAtIsNull(userId, provider);
        if (!hasActiveConsent) {
            throw new ImportConsentRequiredException(provider);
        }
    }

    private String normalizeExternalId(String externalId) {
        if (externalId == null || externalId.isBlank()) {
            return null;
        }
        return externalId.trim();
    }

    private void saveImportItem(
            ImportJob job,
            String externalId,
            ImportItemStatus status,
            String reason,
            MailMessageRequest message
    ) {
        ImportItem item = new ImportItem();
        item.setJob(job);
        item.setExternalId(externalId == null ? "missing-external-id" : externalId);
        item.setRawPayload(toRawPayload(status, reason, message));
        item.setCreatedAt(OffsetDateTime.now());
        importItemRepository.save(item);
    }

    private String toRawPayload(ImportItemStatus status, String reason, MailMessageRequest message) {
        String sanitizedReason = reason == null ? "" : reason.replace("\n", " ").replace("\r", " ");
        String sanitizedSubject = message.subject().replace("\n", " ").replace("\r", " ");
        return STATUS_KEY + status.name()
                + META_SEPARATOR + REASON_KEY + sanitizedReason
                + META_SEPARATOR + "FROM=" + message.from()
                + META_SEPARATOR + "SUBJECT=" + sanitizedSubject;
    }

    private ImportItemStatus extractStatus(String rawPayload) {
        if (rawPayload == null || !rawPayload.startsWith(STATUS_KEY)) {
            return ImportItemStatus.ERROR;
        }

        String statusValue = rawPayload.substring(STATUS_KEY.length()).split("\\|", 2)[0];
        try {
            return ImportItemStatus.valueOf(statusValue);
        } catch (IllegalArgumentException ex) {
            return ImportItemStatus.ERROR;
        }
    }

    private String extractReason(String rawPayload) {
        if (rawPayload == null) {
            return null;
        }

        int reasonStart = rawPayload.indexOf(REASON_KEY);
        if (reasonStart < 0) {
            return null;
        }

        String afterKey = rawPayload.substring(reasonStart + REASON_KEY.length());
        int end = afterKey.indexOf(META_SEPARATOR);
        String reason = end < 0 ? afterKey : afterKey.substring(0, end);
        return reason.isBlank() ? null : reason;
    }

    private String resolveFinalStatus(int processed, int created, int errors) {
        if (processed > 0 && created == 0 && errors == processed) {
            return ImportJobStatus.FAILED.name();
        }
        if (errors > 0) {
            return ImportJobStatus.COMPLETED_WITH_ERRORS.name();
        }
        return ImportJobStatus.COMPLETED.name();
    }

    private String errorItemsToString(List<ImportErrorItemResponse> errorItems) {
        return errorItems.stream()
                .map(error -> error.externalId() + ": " + error.reason())
                .reduce((left, right) -> left + "\n" + right)
                .orElse(null);
    }
}
