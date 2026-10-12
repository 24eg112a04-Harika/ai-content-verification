package com.example.contentverification.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum VerificationStatus {
    SUPPORTED("Supported by available evidence"),
    CONTRADICTED("Contradicted by available evidence"),
    PARTIALLY_SUPPORTED("Partially supported or mixed evidence"),
    INSUFFICIENT_EVIDENCE("Insufficient evidence"),
    ANALYSIS_FAILED("Analysis failed or incomplete");

    private final String displayName;

    VerificationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
