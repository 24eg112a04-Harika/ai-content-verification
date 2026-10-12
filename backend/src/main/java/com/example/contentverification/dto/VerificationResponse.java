package com.example.contentverification.dto;

import com.example.contentverification.enums.InputType;
import com.example.contentverification.enums.ProcessingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String submittedContent;
    private InputType inputType;
    private String originalUrl;
    private ProcessingStatus processingStatus;
    private String overallSummary;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private int totalClaims;
    private int supportedClaims;
    private int contradictedClaims;
    private int mixedClaims;
    private int insufficientClaims;
    private List<ClaimResponse> claims;
}
