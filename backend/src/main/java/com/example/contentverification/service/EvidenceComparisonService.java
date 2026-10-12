package com.example.contentverification.service;

import com.example.contentverification.entity.Claim;
import com.example.contentverification.entity.Evidence;
import com.example.contentverification.entity.Source;
import com.example.contentverification.enums.ClaimType;
import com.example.contentverification.enums.EvidenceType;
import com.example.contentverification.enums.VerificationStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EvidenceComparisonService {

    public record ComparisonResult(
            VerificationStatus status,
            String overallExplanation,
            List<Evidence> generatedEvidence
    ) {}

    private static final Set<String> NEGATION_WORDS = Set.of(
            "not", "never", "denied", "false", "disproved", "untrue", "refuted", "failed", "debunked", "incorrect", "hoax"
    );

    public ComparisonResult compareAndEvaluate(Claim claim, List<Source> sources) {
        if (claim.getClaimType() == ClaimType.OPINION) {
            return new ComparisonResult(
                    VerificationStatus.INSUFFICIENT_EVIDENCE,
                    "This statement expresses a subjective opinion or value judgment. Objective empirical verification cannot conclusively substantiate aesthetic or personal viewpoints.",
                    Collections.emptyList()
            );
        }

        if (claim.getClaimType() == ClaimType.PREDICTION) {
            return new ComparisonResult(
                    VerificationStatus.INSUFFICIENT_EVIDENCE,
                    "This assertion refers to speculative future events or projections. Empirical verification requires retrospective or contemporaneous observational data.",
                    Collections.emptyList()
            );
        }

        if (sources == null || sources.isEmpty()) {
            return new ComparisonResult(
                    VerificationStatus.INSUFFICIENT_EVIDENCE,
                    "No authoritative or verifiable external records could be retrieved for this assertion within configured reference catalogs.",
                    Collections.emptyList()
            );
        }

        List<Evidence> evidenceList = new ArrayList<>();
        int supportingCount = 0;
        int conflictingCount = 0;
        int mixedCount = 0;

        String claimLower = claim.getClaimText().toLowerCase(Locale.ROOT);
        Set<String> claimTokens = tokenize(claimLower);

        for (Source source : sources) {
            String excerpt = source.getSourceMetadata();
            // Fallback excerpt from title/publisher if metadata is brief
            if (excerpt == null || excerpt.length() < 10) {
                excerpt = source.getTitle() + " published by " + source.getPublisher();
            }

            String excerptLower = excerpt.toLowerCase(Locale.ROOT);
            Set<String> excerptTokens = tokenize(excerptLower);

            // Compute token overlap
            double overlapScore = calculateOverlap(claimTokens, excerptTokens);

            // Detect negation or conflict markers
            boolean hasNegation = containsNegation(claimLower, excerptLower);

            EvidenceType evidenceType;
            String explanation;

            if (overlapScore >= 0.40) {
                if (hasNegation) {
                    evidenceType = EvidenceType.CONFLICTING;
                    conflictingCount++;
                    explanation = String.format("Source record from %s presents conflicting terminology or counters the assertion.",
                            source.getPublisher() != null ? source.getPublisher() : "the reference");
                } else {
                    evidenceType = EvidenceType.SUPPORTING;
                    supportingCount++;
                    explanation = String.format("Source record from %s directly corroborates factual components of the assertion.",
                            source.getPublisher() != null ? source.getPublisher() : "the reference");
                }
            } else if (overlapScore >= 0.20) {
                evidenceType = EvidenceType.MIXED;
                mixedCount++;
                explanation = String.format("Source record from %s partially addresses contextual elements of the claim without definitive confirmation.",
                        source.getPublisher() != null ? source.getPublisher() : "the reference");
            } else {
                evidenceType = EvidenceType.INSUFFICIENT;
                explanation = "Retrieved reference discusses tangential subject matter without providing conclusive evidence for this specific assertion.";
            }

            // Cap relevance score between 0.15 and 0.98
            double relevance = Math.min(0.98, Math.max(0.15, Math.round(overlapScore * 100.0) / 100.0));

            Evidence evidence = Evidence.builder()
                    .claim(claim)
                    .source(source)
                    .evidenceType(evidenceType)
                    .evidenceExcerpt(excerpt)
                    .relevanceScore(relevance)
                    .explanation(explanation)
                    .build();

            evidenceList.add(evidence);
        }

        // Determine Overall Verification Status
        VerificationStatus overallStatus;
        StringBuilder explanationBuilder = new StringBuilder();

        if (conflictingCount > 0 && supportingCount == 0) {
            overallStatus = VerificationStatus.CONTRADICTED;
            explanationBuilder.append("Available documented evidence directly contradicts the statement based on retrieved reference records. ");
        } else if (supportingCount > 0 && conflictingCount == 0) {
            overallStatus = VerificationStatus.SUPPORTED;
            explanationBuilder.append("Multiple independent source records corroborate the core factual claims in this statement. ");
        } else if (supportingCount > 0 && conflictingCount > 0) {
            overallStatus = VerificationStatus.PARTIALLY_SUPPORTED;
            explanationBuilder.append("Retrieved sources offer mixed or qualified perspectives; some aspects are corroborated while others remain disputed. ");
        } else if (mixedCount > 0) {
            overallStatus = VerificationStatus.PARTIALLY_SUPPORTED;
            explanationBuilder.append("Available reference materials provide partial context, but lack complete evidentiary corroboration. ");
        } else {
            overallStatus = VerificationStatus.INSUFFICIENT_EVIDENCE;
            explanationBuilder.append("Insufficient documented evidence is currently available in the consulted repositories to definitively substantiate this claim. ");
        }

        explanationBuilder.append("Note: Verification assessments reflect available public documentation at the time of retrieval and do not represent mathematical certainty.");

        return new ComparisonResult(overallStatus, explanationBuilder.toString(), evidenceList);
    }

    private double calculateOverlap(Set<String> setA, Set<String> setB) {
        if (setA.isEmpty() || setB.isEmpty()) return 0.0;
        int matches = 0;
        for (String token : setA) {
            if (setB.contains(token)) {
                matches++;
            }
        }
        return (double) matches / (double) Math.min(setA.size(), 12);
    }

    private boolean containsNegation(String claim, String excerpt) {
        for (String neg : NEGATION_WORDS) {
            if (excerpt.contains(" " + neg + " ") && !claim.contains(" " + neg + " ")) {
                return true;
            }
        }
        return false;
    }

    private Set<String> tokenize(String text) {
        String clean = text.replaceAll("[^a-zA-Z0-9 ]", " ");
        String[] tokens = clean.split("\\s+");
        Set<String> set = new HashSet<>();
        Set<String> stop = Set.of("the", "is", "at", "which", "on", "in", "and", "a", "an", "of", "to", "was", "for", "that", "this", "it", "with", "as", "by");
        for (String t : tokens) {
            if (t.length() > 2 && !stop.contains(t)) {
                set.add(t);
            }
        }
        return set;
    }
}
