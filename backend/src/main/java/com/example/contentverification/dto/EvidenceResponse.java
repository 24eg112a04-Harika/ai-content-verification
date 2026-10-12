package com.example.contentverification.dto;

import com.example.contentverification.enums.EvidenceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceResponse {
    private Long id;
    private Long claimId;
    private EvidenceType evidenceType;
    private String evidenceExcerpt;
    private Double relevanceScore;
    private String explanation;
    private SourceResponse source;
}
