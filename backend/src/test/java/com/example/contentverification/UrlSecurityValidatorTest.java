package com.example.contentverification;

import com.example.contentverification.exception.BadRequestException;
import com.example.contentverification.util.UrlSecurityValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UrlSecurityValidatorTest {

    private UrlSecurityValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UrlSecurityValidator();
    }

    @Test
    void testRejectsNullOrBlankUrl() {
        assertThrows(BadRequestException.class, () -> validator.validateSafeUrl(null));
        assertThrows(BadRequestException.class, () -> validator.validateSafeUrl("   "));
    }

    @Test
    void testRejectsNonHttpProtocols() {
        assertThrows(BadRequestException.class, () -> validator.validateSafeUrl("file:///etc/passwd"));
        assertThrows(BadRequestException.class, () -> validator.validateSafeUrl("ftp://example.com/test.txt"));
        assertThrows(BadRequestException.class, () -> validator.validateSafeUrl("gopher://example.com"));
    }

    @Test
    void testRejectsLocalhostAndInternalAddresses() {
        assertThrows(BadRequestException.class, () -> validator.validateSafeUrl("http://localhost:8080/secret"));
        assertThrows(BadRequestException.class, () -> validator.validateSafeUrl("http://127.0.0.1/admin"));
        assertThrows(BadRequestException.class, () -> validator.validateSafeUrl("http://0.0.0.0/"));
    }
}
