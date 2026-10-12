package com.example.contentverification.service;

import com.example.contentverification.enums.ClaimType;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ClaimExtractionService {

    public record ExtractedClaimDto(String text, ClaimType type, String rationale) {}

    private static final List<String> OPINION_MARKERS = Arrays.asList(
            "i believe", "i think", "in my opinion", "in our view", "arguably",
            "beautiful", "ugly", "wonderful", "terrible", "best ever", "worst ever",
            "feels like", "should arguably", "undeniably great", "personally"
    );

    private static final List<String> PREDICTION_MARKERS = Arrays.asList(
            "predict", "predicts", "prediction", "will likely", "will reach", "will become", "will double",
            "is expected to", "might happen next", "predicted to", "projected to", "in the coming decades",
            "future generations will", "forecasted to", "forecast"
    );

    public List<ExtractedClaimDto> extractClaims(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return Collections.emptyList();
        }

        // Clean and normalize text
        String normalized = rawText
                .replaceAll("\\r\\n", "\n")
                .replaceAll("[\\t\\f]", " ")
                .replaceAll("[“”]", "\"")
                .replaceAll("[‘’]", "'")
                .trim();

        // Split by lines or sentence boundaries (. ! ?)
        List<String> rawSentences = splitIntoSentences(normalized);
        List<ExtractedClaimDto> extractedClaims = new ArrayList<>();

        for (String sentence : rawSentences) {
            String trimmed = sentence.trim();
            if (trimmed.length() < 12) {
                continue; // Skip negligible fragments
            }

            // Exclude purely interrogative sentences
            if (trimmed.endsWith("?") && !trimmed.contains(" claimed that ")) {
                continue;
            }

            ClaimType claimType = classifyClaimType(trimmed);
            String rationale = switch (claimType) {
                case FACTUAL -> "Identified verifiable assertion regarding empirical events, entities, or stated data.";
                case OPINION -> "Contains subjective qualifiers or value judgment language.";
                case PREDICTION -> "Speculative assertion projecting future outcomes or unoccurred events.";
            };

            // Clean sentence punctuation
            String cleanClaim = cleanSentence(trimmed);

            extractedClaims.add(new ExtractedClaimDto(cleanClaim, claimType, rationale));
        }

        // Fallback: If no discrete sentences could be split, capture the whole text
        if (extractedClaims.isEmpty() && !normalized.isBlank()) {
            extractedClaims.add(new ExtractedClaimDto(
                    normalized.length() > 300 ? normalized.substring(0, 300) + "..." : normalized,
                    ClaimType.FACTUAL,
                    "Default extracted statement from submitted source."
            ));
        }

        return extractedClaims;
    }

    private ClaimType classifyClaimType(String sentence) {
        String lower = sentence.toLowerCase(Locale.ROOT);

        for (String marker : OPINION_MARKERS) {
            if (lower.contains(marker)) {
                return ClaimType.OPINION;
            }
        }

        for (String marker : PREDICTION_MARKERS) {
            if (lower.contains(marker)) {
                return ClaimType.PREDICTION;
            }
        }

        return ClaimType.FACTUAL;
    }

    private List<String> splitIntoSentences(String text) {
        List<String> result = new ArrayList<>();
        // Split on period/exclamation followed by space or newline, or list bullets
        String[] lines = text.split("\n+");
        for (String line : lines) {
            String trimmedLine = line.trim();
            if (trimmedLine.isBlank()) continue;

            // Remove list bullet prefixes like "1. ", "• ", "- "
            trimmedLine = trimmedLine.replaceAll("^(?:\\d+\\.|[•\\-*#])\\s*", "");

            // Regex for sentence split preserving abbreviations
            Pattern pattern = Pattern.compile("(?<=[.!?])\\s+(?=[A-Z0-9\"])");
            String[] splits = pattern.split(trimmedLine);
            for (String s : splits) {
                String st = s.trim();
                if (!st.isEmpty()) {
                    result.add(st);
                }
            }
        }
        return result;
    }

    private String cleanSentence(String sentence) {
        // Remove trailing or leading quotes/spaces
        return sentence.replaceAll("^[\"']+|[\"']+$", "").trim();
    }
}
