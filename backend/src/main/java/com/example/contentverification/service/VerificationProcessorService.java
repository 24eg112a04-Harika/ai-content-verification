package com.example.contentverification.service;

import com.example.contentverification.entity.*;
import com.example.contentverification.enums.ProcessingStatus;
import com.example.contentverification.enums.VerificationStatus;
import com.example.contentverification.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Separated from VerificationService so that Spring's @Async proxy
 * actually intercepts the call (self-invocation bypasses AOP proxies).
 */
@Service
@RequiredArgsConstructor
public class VerificationProcessorService {

    private static final Logger logger = LoggerFactory.getLogger(VerificationProcessorService.class);

    private final VerificationRecordRepository verificationRecordRepository;
    private final ClaimRepository claimRepository;
    private final EvidenceRepository evidenceRepository;
    private final ClaimExtractionService claimExtractionService;
    private final SourceRetrievalService sourceRetrievalService;
    private final EvidenceComparisonService evidenceComparisonService;

    @Async
    public void processVerificationAsync(Long recordId) {
        try {
            VerificationRecord record = verificationRecordRepository.findById(recordId)
                    .orElse(null);
            if (record == null) return;

            record.setProcessingStatus(ProcessingStatus.PROCESSING);
            verificationRecordRepository.save(record);

            // 1. Extract claims
            List<ClaimExtractionService.ExtractedClaimDto> extractedDtos =
                    claimExtractionService.extractClaims(record.getSubmittedContent());

            int supported = 0;
            int contradicted = 0;
            int mixed = 0;
            int insufficient = 0;

            List<Claim> createdClaims = new ArrayList<>();

            for (ClaimExtractionService.ExtractedClaimDto dto : extractedDtos) {
                Claim claim = Claim.builder()
                        .verificationRecord(record)
                        .claimText(dto.text())
                        .claimType(dto.type())
                        .verificationStatus(VerificationStatus.INSUFFICIENT_EVIDENCE)
                        .explanation(dto.rationale())
                        .createdAt(LocalDateTime.now())
                        .build();

                claim = claimRepository.save(claim);

                // 2. Retrieve sources
                List<Source> sources = sourceRetrievalService.retrieveAndStoreSources(claim.getClaimText());

                // 3. Compare evidence
                EvidenceComparisonService.ComparisonResult compResult =
                        evidenceComparisonService.compareAndEvaluate(claim, sources);

                claim.setVerificationStatus(compResult.status());
                claim.setExplanation(compResult.overallExplanation());
                claim = claimRepository.save(claim);

                // Save evidence items
                if (compResult.generatedEvidence() != null && !compResult.generatedEvidence().isEmpty()) {
                    for (Evidence ev : compResult.generatedEvidence()) {
                        ev.setClaim(claim);
                        evidenceRepository.save(ev);
                    }
                }

                switch (compResult.status()) {
                    case SUPPORTED -> supported++;
                    case CONTRADICTED -> contradicted++;
                    case PARTIALLY_SUPPORTED -> mixed++;
                    default -> insufficient++;
                }

                createdClaims.add(claim);
            }

            // Synthesize overall record summary
            String summary = String.format(
                    "Verification analyzed %d statements: %d supported by available documentation, %d contradicted, %d mixed or partially supported, and %d with insufficient evidence.",
                    createdClaims.size(), supported, contradicted, mixed, insufficient
            );

            record.setOverallSummary(summary);
            record.setProcessingStatus(ProcessingStatus.COMPLETED);
            record.setCompletedAt(LocalDateTime.now());
            verificationRecordRepository.save(record);

        } catch (Exception e) {
            logger.error("Error processing verification async for record {}", recordId, e);
            verificationRecordRepository.findById(recordId).ifPresent(r -> {
                r.setProcessingStatus(ProcessingStatus.FAILED);
                r.setOverallSummary("Processing failed due to an error: " + e.getMessage());
                r.setCompletedAt(LocalDateTime.now());
                verificationRecordRepository.save(r);
            });
        }
    }
}
