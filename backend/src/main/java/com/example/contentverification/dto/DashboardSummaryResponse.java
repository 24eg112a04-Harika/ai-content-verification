package com.example.contentverification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalRequests;
    private long totalClaimsAnalyzed;
    private long supportedClaims;
    private long contradictedClaims;
    private long mixedClaims;
    private long insufficientEvidenceClaims;
    private long analysisFailedClaims;
    private double supportedPercentage;
    private double contradictedPercentage;
    private double mixedPercentage;
    private double insufficientPercentage;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> requestsByInputType;
}
