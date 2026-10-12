package com.example.contentverification.dto;

import com.example.contentverification.enums.ClaimType;
import com.example.contentverification.enums.VerificationStatus;
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
public class ClaimResponse {
    private Long id;
    private Long verificationRecordId;
    private String claimText;
    private ClaimType claimType;
    private VerificationStatus verificationStatus;
    private String statusDisplayName;
    private String explanation;
    private LocalDateTime createdAt;
    private List<EvidenceResponse> evidenceList;
}
