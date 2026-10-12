package com.example.contentverification;

import com.example.contentverification.enums.ClaimType;
import com.example.contentverification.service.ClaimExtractionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ClaimExtractionServiceTest {

    private ClaimExtractionService claimExtractionService;

    @BeforeEach
    void setUp() {
        claimExtractionService = new ClaimExtractionService();
    }

    @Test
    void testExtractChandrayaan3Example() {
        String input = "India launched Chandrayaan-3 in 2023. The mission successfully landed near the Moon's south polar region.";
        List<ClaimExtractionService.ExtractedClaimDto> claims = claimExtractionService.extractClaims(input);

        assertNotNull(claims);
        assertEquals(2, claims.size());
        assertEquals("India launched Chandrayaan-3 in 2023.", claims.get(0).text());
        assertEquals(ClaimType.FACTUAL, claims.get(0).type());
        assertEquals("The mission successfully landed near the Moon's south polar region.", claims.get(1).text());
        assertEquals(ClaimType.FACTUAL, claims.get(1).type());
    }

    @Test
    void testDistinguishOpinionsAndPredictions() {
        String input = "The spacecraft is arguably the most beautiful vessel ever built. Scientists predict solar activity will double by 2050.";
        List<ClaimExtractionService.ExtractedClaimDto> claims = claimExtractionService.extractClaims(input);

        assertEquals(2, claims.size());
        assertEquals(ClaimType.OPINION, claims.get(0).type());
        assertEquals(ClaimType.PREDICTION, claims.get(1).type());
    }
}
