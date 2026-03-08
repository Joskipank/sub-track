package com.subscriptionmanager.importing.parser;

import com.subscriptionmanager.importing.dto.MailMessageRequest;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GmailNetflixParserTest {

    private final GmailNetflixParser parser = new GmailNetflixParser();

    @Test
    void parseSuccessForNetflixTemplate() {
        MailMessageRequest message = new MailMessageRequest(
                "ext-1",
                "billing@netflix.com",
                "Netflix renewal notice",
                "Your Netflix renewal is scheduled for 2026-03-20. Amount: 9.99 USD",
                OffsetDateTime.parse("2026-03-08T10:00:00Z")
        );

        GmailNetflixParser.ParseResult result = parser.parse(message);

        assertTrue(result.success());
        assertEquals("Netflix", result.parsedSubscription().serviceName());
        assertEquals(BigDecimal.valueOf(9.99).setScale(2), result.parsedSubscription().amount());
        assertEquals(LocalDate.of(2026, 3, 20), result.parsedSubscription().nextBillingDate());
    }

    @Test
    void parseFailsWhenDateMissing() {
        MailMessageRequest message = new MailMessageRequest(
                "ext-2",
                "billing@netflix.com",
                "Netflix renewal notice",
                "Amount: 9.99 USD",
                OffsetDateTime.parse("2026-03-08T10:00:00Z")
        );

        GmailNetflixParser.ParseResult result = parser.parse(message);

        assertFalse(result.success());
        assertTrue(result.reason().contains("next billing date"));
    }
}
