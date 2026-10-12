package com.example.contentverification;

import com.example.contentverification.entity.Claim;
import com.example.contentverification.entity.Source;
import com.example.contentverification.enums.ClaimType;
import com.example.contentverification.enums.VerificationStatus;
import com.example.contentverification.service.EvidenceComparisonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class EvidenceComparisonServiceTest {

    private EvidenceComparisonService comparisonService;

    @BeforeEach
    void setUp() {
        comparisonService = new EvidenceComparisonService();
    }

    @Test
    void testCompareSupportedClaim() {
        Claim claim = Claim.builder()
                .claimText("India launched Chandrayaan-3 in 2023.")
                .claimType(ClaimType.FACTUAL)
                .build();

        Source source = Source.builder()
                .url("https://www.isro.gov.in/Chandrayaan3.html")
                .title("ISRO Official Release: Chandrayaan-3 Mission Profile")
                .publisher("Indian Space Research Organisation (ISRO)")
                .contentExcerpt("India successfully accomplished lunar soft landing of the Vikram Lander with Pragyan Rover on the lunar south polar region on August 23, 2023. Launched on 14 July 2023.")
                .sourceMetadata("{\"organization\":\"ISRO\",\"verification_confidence\":\"authoritative\"}")
                .retrievedAt(LocalDateTime.now())
                .build();

        EvidenceComparisonService.ComparisonResult result =
                comparisonService.compareAndEvaluate(claim, List.of(source));

        assertEquals(VerificationStatus.SUPPORTED, result.status());
        assertFalse(result.generatedEvidence().isEmpty());
        assertTrue(result.overallExplanation().contains("corroborate"));
    }

    @Test
    void testCompareOpinionReturnsInsufficient() {
        Claim claim = Claim.builder()
                .claimText("This movie is the best piece of art ever.")
                .claimType(ClaimType.OPINION)
                .build();

        EvidenceComparisonService.ComparisonResult result =
                comparisonService.compareAndEvaluate(claim, List.of());

        assertEquals(VerificationStatus.INSUFFICIENT_EVIDENCE, result.status());
        assertTrue(result.overallExplanation().contains("subjective opinion"));
    }
}
