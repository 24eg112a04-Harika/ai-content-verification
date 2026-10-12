package com.example.contentverification.service;

import com.example.contentverification.dto.*;
import com.example.contentverification.entity.ActivityLog;
import com.example.contentverification.entity.Source;
import com.example.contentverification.entity.User;
import com.example.contentverification.entity.VerificationRecord;
import com.example.contentverification.enums.AccountStatus;
import com.example.contentverification.enums.InputType;
import com.example.contentverification.enums.ProcessingStatus;
import com.example.contentverification.enums.Role;
import com.example.contentverification.enums.VerificationStatus;
import com.example.contentverification.exception.BadRequestException;
import com.example.contentverification.exception.ResourceNotFoundException;
import com.example.contentverification.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final VerificationRecordRepository verificationRecordRepository;
    private final ClaimRepository claimRepository;
    private final SourceRepository sourceRepository;
    private final ActivityLogRepository activityLogRepository;
    private final VerificationService verificationService;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(u -> {
            long verifications = verificationRecordRepository.countByUserId(u.getId());
            return AdminUserResponse.builder()
                    .id(u.getId())
                    .fullName(u.getFullName())
                    .email(u.getEmail())
                    .role(u.getRole())
                    .accountStatus(u.getAccountStatus())
                    .createdAt(u.getCreatedAt())
                    .updatedAt(u.getUpdatedAt())
                    .totalVerifications(verifications)
                    .build();
        }).toList();
    }

    @Transactional
    public AdminUserResponse updateUserStatus(Long userId, UserStatusUpdateRequest request, Long adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getId().equals(adminUserId) && request.getStatus() == AccountStatus.INACTIVE) {
            throw new BadRequestException("Administrators cannot deactivate their own account");
        }

        if (request.getStatus() != null) {
            user.setAccountStatus(request.getStatus());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        activityLogService.logActivity(adminUserId, "ADMIN_UPDATE_USER_STATUS", "User", user.getId());

        long count = verificationRecordRepository.countByUserId(user.getId());
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .totalVerifications(count)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getAllVerifications(ProcessingStatus status, String query) {
        List<VerificationRecord> records = verificationRecordRepository.searchAllRecords(status, (query != null && !query.isBlank()) ? query.trim() : null);
        return records.stream().map(verificationService::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DashboardActivityResponse> getAllActivityLogs() {
        List<ActivityLog> logs = activityLogRepository.findTop15ByOrderByCreatedAtDesc();
        return logs.stream().map(log -> DashboardActivityResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : "System")
                .userName(log.getUser() != null ? log.getUser().getFullName() : "System")
                .createdAt(log.getCreatedAt())
                .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public List<SourceResponse> getAllSources(String query) {
        List<Source> sources = sourceRepository.searchSources((query != null && !query.isBlank()) ? query.trim() : null);
        return sources.stream().map(s -> SourceResponse.builder()
                .id(s.getId())
                .url(s.getUrl())
                .title(s.getTitle())
                .publisher(s.getPublisher())
                .publicationDate(s.getPublicationDate())
                .retrievedAt(s.getRetrievedAt())
                .sourceMetadata(s.getSourceMetadata())
                .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSystemWideSummary() {
        long totalRequests = verificationRecordRepository.count();
        long totalClaims = claimRepository.count();

        long supported = claimRepository.countByVerificationStatus(VerificationStatus.SUPPORTED);
        long contradicted = claimRepository.countByVerificationStatus(VerificationStatus.CONTRADICTED);
        long mixed = claimRepository.countByVerificationStatus(VerificationStatus.PARTIALLY_SUPPORTED);
        long insufficient = claimRepository.countByVerificationStatus(VerificationStatus.INSUFFICIENT_EVIDENCE);
        long failed = claimRepository.countByVerificationStatus(VerificationStatus.ANALYSIS_FAILED);

        double supportedPct = totalClaims > 0 ? Math.round((double) supported / totalClaims * 1000.0) / 10.0 : 0.0;
        double contradictedPct = totalClaims > 0 ? Math.round((double) contradicted / totalClaims * 1000.0) / 10.0 : 0.0;
        double mixedPct = totalClaims > 0 ? Math.round((double) mixed / totalClaims * 1000.0) / 10.0 : 0.0;
        double insufficientPct = totalClaims > 0 ? Math.round((double) insufficient / totalClaims * 1000.0) / 10.0 : 0.0;

        Map<String, Long> statusDistribution = new HashMap<>();
        statusDistribution.put("Supported", supported);
        statusDistribution.put("Contradicted", contradicted);
        statusDistribution.put("Partially Supported", mixed);
        statusDistribution.put("Insufficient Evidence", insufficient);

        // Group requests by input channel (same semantics as the user dashboard)
        List<VerificationRecord> records = verificationRecordRepository.findAll();
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
}
