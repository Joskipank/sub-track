package com.subscriptionmanager.importing.parser;

import com.subscriptionmanager.common.enums.BillingPeriod;
import com.subscriptionmanager.importing.dto.MailMessageRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GmailNetflixParser {
    private static final String DEFAULT_CURRENCY = "USD";

    private static final SupportedTemplate NETFLIX_TEMPLATE =
            new SupportedTemplate("Netflix", "Entertainment", List.of("netflix"));
    private static final SupportedTemplate SPOTIFY_TEMPLATE =
            new SupportedTemplate("Spotify", "Entertainment", List.of("spotify"));
    private static final SupportedTemplate YOUTUBE_PREMIUM_TEMPLATE =
            new SupportedTemplate("YouTube Premium", "Entertainment", List.of("youtube premium", "youtube"));
    private static final List<SupportedTemplate> SUPPORTED_TEMPLATES =
            List.of(NETFLIX_TEMPLATE, SPOTIFY_TEMPLATE, YOUTUBE_PREMIUM_TEMPLATE);

    private static final Pattern DATE_PATTERN = Pattern.compile("\\b(20\\d{2}-\\d{2}-\\d{2})\\b");
    private static final Pattern AMOUNT_WITH_CURRENCY_PATTERN =
            Pattern.compile("(?i)(?:amount|charge(?:d)?|renewal|payment|total)\\s*[:=]?\\s*(\\d+(?:[.,]\\d{1,2})?)\\s*([A-Z]{3})");
    private static final Pattern CURRENCY_BEFORE_AMOUNT_PATTERN = Pattern.compile("(?i)\\b([A-Z]{3})\\s*(\\d+(?:[.,]\\d{1,2})?)\\b");
    private static final Pattern AMOUNT_DOLLAR_PATTERN = Pattern.compile("\\$\\s*(\\d+(?:[.,]\\d{1,2})?)");

    public ParseResult parse(MailMessageRequest message) {
        String merged = message.subject() + "\n" + message.body();
        SupportedTemplate template = detectTemplate(merged, message.from());

        if (template == null) {
            return ParseResult.error("unsupported template: supported services are Netflix, Spotify and YouTube Premium");
        }

        LocalDate nextBillingDate = parseDate(merged)
                .orElse(null);
        if (nextBillingDate == null) {
            return ParseResult.error("parser could not extract next billing date (expected YYYY-MM-DD)");
        }

        AmountWithCurrency amountWithCurrency = parseAmount(merged)
                .orElse(null);
        if (amountWithCurrency == null || amountWithCurrency.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return ParseResult.error("parser could not extract valid amount");
        }

        ParsedSubscription parsedSubscription = new ParsedSubscription(
                template.serviceName(),
                amountWithCurrency.amount(),
                amountWithCurrency.currency(),
                BillingPeriod.MONTHLY,
                nextBillingDate,
                template.categoryName()
        );
        return ParseResult.success(parsedSubscription);
    }

    private SupportedTemplate detectTemplate(String merged, String from) {
        String normalizedMerged = merged.toLowerCase(Locale.ROOT);
        String normalizedFrom = from.toLowerCase(Locale.ROOT);

        for (SupportedTemplate template : SUPPORTED_TEMPLATES) {
            for (String marker : template.markers()) {
                if (normalizedMerged.contains(marker) || normalizedFrom.contains(marker)) {
                    return template;
                }
            }
        }

        return null;
    }

    private Optional<LocalDate> parseDate(String text) {
        Matcher dateMatcher = DATE_PATTERN.matcher(text);
        if (!dateMatcher.find()) {
            return Optional.empty();
        }

        try {
            return Optional.of(LocalDate.parse(dateMatcher.group(1)));
        } catch (DateTimeParseException ignored) {
            return Optional.empty();
        }
    }

    private Optional<AmountWithCurrency> parseAmount(String text) {
        Matcher amountCurrencyMatcher = AMOUNT_WITH_CURRENCY_PATTERN.matcher(text);
        if (amountCurrencyMatcher.find()) {
            BigDecimal amount = parseDecimal(amountCurrencyMatcher.group(1));
            if (amount == null) {
                return Optional.empty();
            }
            return Optional.of(new AmountWithCurrency(amount, amountCurrencyMatcher.group(2).toUpperCase()));
        }

        Matcher currencyBeforeAmountMatcher = CURRENCY_BEFORE_AMOUNT_PATTERN.matcher(text);
        if (currencyBeforeAmountMatcher.find()) {
            BigDecimal amount = parseDecimal(currencyBeforeAmountMatcher.group(2));
            if (amount == null) {
                return Optional.empty();
            }
            return Optional.of(new AmountWithCurrency(amount, currencyBeforeAmountMatcher.group(1).toUpperCase()));
        }

        Matcher dollarMatcher = AMOUNT_DOLLAR_PATTERN.matcher(text);
        if (dollarMatcher.find()) {
            BigDecimal amount = parseDecimal(dollarMatcher.group(1));
            if (amount == null) {
                return Optional.empty();
            }
            return Optional.of(new AmountWithCurrency(amount, DEFAULT_CURRENCY));
        }

        return Optional.empty();
    }

    private BigDecimal parseDecimal(String raw) {
        try {
            return new BigDecimal(raw.replace(',', '.')).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private record AmountWithCurrency(BigDecimal amount, String currency) {
    }

    private record SupportedTemplate(String serviceName, String categoryName, List<String> markers) {
    }

    public record ParsedSubscription(
            String serviceName,
            BigDecimal amount,
            String currency,
            BillingPeriod billingPeriod,
            LocalDate nextBillingDate,
            String categoryName
    ) {
    }

    public record ParseResult(
            boolean success,
            ParsedSubscription parsedSubscription,
            String reason
    ) {
        public static ParseResult success(ParsedSubscription parsedSubscription) {
            return new ParseResult(true, parsedSubscription, null);
        }

        public static ParseResult error(String reason) {
            return new ParseResult(false, null, reason);
        }
    }
}
