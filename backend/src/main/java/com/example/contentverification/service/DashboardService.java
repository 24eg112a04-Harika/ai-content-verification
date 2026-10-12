package com.example.contentverification.service;

import com.example.contentverification.dto.DashboardActivityResponse;
import com.example.contentverification.dto.DashboardSummaryResponse;
import com.example.contentverification.entity.ActivityLog;
import com.example.contentverification.entity.VerificationRecord;
import com.example.contentverification.enums.InputType;
import com.example.contentverification.enums.VerificationStatus;
import com.example.contentverification.repository.ActivityLogRepository;
import com.example.contentverification.repository.ClaimRepository;
import com.example.contentverification.repository.VerificationRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VerificationRecordRepository verificationRecordRepository;
    private final ClaimRepository claimRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getUserDashboardSummary(Long userId) {
        long totalRequests = verificationRecordRepository.countByUserId(userId);
        long totalClaims = claimRepository.countByUserId(userId);

        long supported = claimRepository.countByUserIdAndStatus(userId, VerificationStatus.SUPPORTED);
        long contradicted = claimRepository.countByUserIdAndStatus(userId, VerificationStatus.CONTRADICTED);
        long mixed = claimRepository.countByUserIdAndStatus(userId, VerificationStatus.PARTIALLY_SUPPORTED);
        long insufficient = claimRepository.countByUserIdAndStatus(userId, VerificationStatus.INSUFFICIENT_EVIDENCE);
        long failed = claimRepository.countByUserIdAndStatus(userId, VerificationStatus.ANALYSIS_FAILED);

        double supportedPct = totalClaims > 0 ? Math.round((double) supported / totalClaims * 1000.0) / 10.0 : 0.0;
        double contradictedPct = totalClaims > 0 ? Math.round((double) contradicted / totalClaims * 1000.0) / 10.0 : 0.0;
        double mixedPct = totalClaims > 0 ? Math.round((double) mixed / totalClaims * 1000.0) / 10.0 : 0.0;
        double insufficientPct = totalClaims > 0 ? Math.round((double) insufficient / totalClaims * 1000.0) / 10.0 : 0.0;

        Map<String, Long> statusDistribution = new HashMap<>();
        statusDistribution.put("Supported", supported);
        statusDistribution.put("Contradicted", contradicted);
        statusDistribution.put("Partially Supported", mixed);
        statusDistribution.put("Insufficient Evidence", insufficient);

        // Group requests by input type
        List<VerificationRecord> records = verificationRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Map<String, Long> requestsByType = new HashMap<>();
        requestsByType.put("Text", records.stream().filter(r -> r.getInputType() == InputType.TEXT).count());
        requestsByType.put("Article URL", records.stream().filter(r -> r.getInputType() == InputType.URL).count());
        requestsByType.put("File Upload", records.stream().filter(r -> r.getInputType() == InputType.FILE).count());

        return DashboardSummaryResponse.builder()
                .totalRequests(totalRequests)
                .totalClaimsAnalyzed(totalClaims)
                .supportedClaims(supported)
                .contradictedClaims(contradicted)
                .mixedClaims(mixed)
                .insufficientEvidenceClaims(insufficient)
                .analysisFailedClaims(failed)
                .supportedPercentage(supportedPct)
                .contradictedPercentage(contradictedPct)
                .mixedPercentage(mixedPct)
                .insufficientPercentage(insufficientPct)
                .statusDistribution(statusDistribution)
                .requestsByInputType(requestsByType)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DashboardActivityResponse> getUserRecentActivity(Long userId) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return logs.stream().limit(10).map(this::mapLogToResponse).toList();
    }

    private DashboardActivityResponse mapLogToResponse(ActivityLog log) {
        return DashboardActivityResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : "system")
                .userName(log.getUser() != null ? log.getUser().getFullName() : "System")
                .createdAt(log.getCreatedAt())
                .build();
    }
}
