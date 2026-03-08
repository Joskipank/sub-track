package com.subscriptionmanager.importing.parser;

import com.subscriptionmanager.common.enums.BillingPeriod;
import com.subscriptionmanager.importing.dto.MailMessageRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GmailNetflixParser {
    private static final String SERVICE_NAME = "Netflix";
    private static final String DEFAULT_CURRENCY = "USD";
    private static final String DEFAULT_CATEGORY = "Entertainment";

    private static final Pattern DATE_PATTERN = Pattern.compile("\\b(20\\d{2}-\\d{2}-\\d{2})\\b");
    private static final Pattern AMOUNT_WITH_CURRENCY_PATTERN =
            Pattern.compile("(?i)(?:amount|charge(?:d)?|renewal)\\s*[:=]?\\s*(\\d+(?:[.,]\\d{1,2})?)\\s*([A-Z]{3})");
    private static final Pattern AMOUNT_DOLLAR_PATTERN = Pattern.compile("\\$\\s*(\\d+(?:[.,]\\d{1,2})?)");

    public ParseResult parse(MailMessageRequest message) {
        String merged = (message.subject() + "\n" + message.body()).toLowerCase();
        boolean isNetflix = merged.contains("netflix") || message.from().toLowerCase().contains("netflix");

        if (!isNetflix) {
            return ParseResult.error("unsupported template: only netflix gmail emails are supported");
        }

        LocalDate nextBillingDate = parseDate(message.body())
                .orElse(null);
        if (nextBillingDate == null) {
            return ParseResult.error("parser could not extract next billing date (expected YYYY-MM-DD)");
        }

        AmountWithCurrency amountWithCurrency = parseAmount(message.body())
                .orElse(null);
        if (amountWithCurrency == null || amountWithCurrency.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return ParseResult.error("parser could not extract valid amount");
        }

        ParsedSubscription parsedSubscription = new ParsedSubscription(
                SERVICE_NAME,
                amountWithCurrency.amount(),
                amountWithCurrency.currency(),
                BillingPeriod.MONTHLY,
                nextBillingDate,
                DEFAULT_CATEGORY
        );
        return ParseResult.success(parsedSubscription);
    }

    private Optional<LocalDate> parseDate(String body) {
        Matcher dateMatcher = DATE_PATTERN.matcher(body);
        if (!dateMatcher.find()) {
            return Optional.empty();
        }

        try {
            return Optional.of(LocalDate.parse(dateMatcher.group(1)));
        } catch (DateTimeParseException ignored) {
            return Optional.empty();
        }
    }

    private Optional<AmountWithCurrency> parseAmount(String body) {
        Matcher amountCurrencyMatcher = AMOUNT_WITH_CURRENCY_PATTERN.matcher(body);
        if (amountCurrencyMatcher.find()) {
            BigDecimal amount = parseDecimal(amountCurrencyMatcher.group(1));
            if (amount == null) {
                return Optional.empty();
            }
            return Optional.of(new AmountWithCurrency(amount, amountCurrencyMatcher.group(2).toUpperCase()));
        }

        Matcher dollarMatcher = AMOUNT_DOLLAR_PATTERN.matcher(body);
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
