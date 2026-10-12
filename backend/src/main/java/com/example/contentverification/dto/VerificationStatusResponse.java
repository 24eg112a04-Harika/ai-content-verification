package com.example.contentverification.dto;

import com.example.contentverification.enums.ProcessingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationStatusResponse {
    private Long id;
    private ProcessingStatus processingStatus;
    private String message;
    private int progressPercentage;
    private Long completedAtTimestamp;
}
