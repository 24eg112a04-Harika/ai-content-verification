package com.example.contentverification.service;

import com.example.contentverification.dto.*;
import com.example.contentverification.entity.*;
import com.example.contentverification.enums.InputType;
import com.example.contentverification.enums.ProcessingStatus;
import com.example.contentverification.exception.ResourceNotFoundException;
import com.example.contentverification.exception.UnauthorizedException;
import com.example.contentverification.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private static final Logger logger = LoggerFactory.getLogger(VerificationService.class);

    private final VerificationRecordRepository verificationRecordRepository;
    private final ClaimRepository claimRepository;
    private final EvidenceRepository evidenceRepository;
    private final UserRepository userRepository;
    private final SafeUrlFetchService safeUrlFetchService;
    private final FileProcessingService fileProcessingService;
    private final ActivityLogService activityLogService;
    private final VerificationProcessorService verificationProcessorService;

    @Transactional
    public VerificationResponse submitTextVerification(Long userId, TextVerificationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        VerificationRecord record = VerificationRecord.builder()
                .user(user)
                .submittedContent(request.getText().trim())
                .inputType(InputType.TEXT)
                .processingStatus(ProcessingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        record = verificationRecordRepository.save(record);
        activityLogService.logActivity(userId, "SUBMIT_TEXT_VERIFICATION", "VerificationRecord", record.getId());

        // Process asynchronously via separate bean (ensures @Async proxy works)
        verificationProcessorService.processVerificationAsync(record.getId());

        return mapToResponse(record);
    }

    @Transactional
    public VerificationResponse submitUrlVerification(Long userId, UrlVerificationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        SafeUrlFetchService.FetchedContent fetched = safeUrlFetchService.fetchArticleContent(request.getUrl());

        VerificationRecord record = VerificationRecord.builder()
                .user(user)
                .submittedContent(fetched.textContent())
                .inputType(InputType.URL)
                .originalUrl(request.getUrl().trim())
                .processingStatus(ProcessingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        record = verificationRecordRepository.save(record);
        activityLogService.logActivity(userId, "SUBMIT_URL_VERIFICATION", "VerificationRecord", record.getId());

        verificationProcessorService.processVerificationAsync(record.getId());

        return mapToResponse(record);
    }

    @Transactional
    public VerificationResponse submitFileVerification(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        FileProcessingService.ExtractedFileContent extracted = fileProcessingService.processUploadedFile(file);

        VerificationRecord record = VerificationRecord.builder()
                .user(user)
                .submittedContent(extracted.textContent())
                .inputType(InputType.FILE)
                .originalUrl("Uploaded File: " + extracted.fileName())
                .processingStatus(ProcessingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        record = verificationRecordRepository.save(record);
        activityLogService.logActivity(userId, "SUBMIT_FILE_VERIFICATION", "VerificationRecord", record.getId());

        verificationProcessorService.processVerificationAsync(record.getId());

        return mapToResponse(record);
    }


    @Transactional(readOnly = true)
    public VerificationResponse getVerificationById(Long id, Long currentUserId, boolean isAdmin) {
        VerificationRecord record = verificationRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found: " + id));

        if (!isAdmin && !record.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You do not have permission to access this verification record");
        }

        return mapToResponse(record);
    }

    @Transactional(readOnly = true)
    public VerificationStatusResponse getVerificationStatus(Long id, Long currentUserId, boolean isAdmin) {
        VerificationRecord record = verificationRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found: " + id));

        if (!isAdmin && !record.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You do not have permission to access this record status");
        }

        int progress = switch (record.getProcessingStatus()) {
            case PENDING -> 15;
            case PROCESSING -> 65;
            case COMPLETED -> 100;
            case FAILED -> 100;
        };

        String msg = switch (record.getProcessingStatus()) {
            case PENDING -> "Queued for claim extraction and source retrieval...";
            case PROCESSING -> "Extracting claims, querying reference catalogs, and evaluating evidence...";
            case COMPLETED -> "Verification completed successfully.";
            case FAILED -> "Verification processing encountered an error.";
        };

        return VerificationStatusResponse.builder()
                .id(record.getId())
                .processingStatus(record.getProcessingStatus())
                .message(msg)
                .progressPercentage(progress)
                .completedAtTimestamp(record.getCompletedAt() != null ? record.getCompletedAt().toInstant(ZoneOffset.UTC).toEpochMilli() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getUserVerifications(Long userId, ProcessingStatus status, String query) {
        List<VerificationRecord> records = verificationRecordRepository.searchUserRecords(
                userId, status, (query != null && !query.isBlank()) ? query.trim() : null
        );

        return records.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void deleteVerification(Long id, Long currentUserId, boolean isAdmin) {
        VerificationRecord record = verificationRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found: " + id));

        if (!isAdmin && !record.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only delete your own verification records");
        }

        verificationRecordRepository.delete(record);
        activityLogService.logActivity(currentUserId, "DELETE_VERIFICATION", "VerificationRecord", id);
    }

    public VerificationResponse mapToResponse(VerificationRecord record) {
        List<Claim> claims = claimRepository.findByVerificationRecordIdOrderByCreatedAtAsc(record.getId());

        int supported = 0;
        int contradicted = 0;
        int mixed = 0;
        int insufficient = 0;

        List<ClaimResponse> claimResponses = new ArrayList<>();
        for (Claim c : claims) {
            List<Evidence> evidences = evidenceRepository.findByClaimId(c.getId());
            List<EvidenceResponse> evidenceResponses = evidences.stream().map(ev ->
                    EvidenceResponse.builder()
                            .id(ev.getId())
                            .claimId(c.getId())
                            .evidenceType(ev.getEvidenceType())
                            .evidenceExcerpt(ev.getEvidenceExcerpt())
                            .relevanceScore(ev.getRelevanceScore())
                            .explanation(ev.getExplanation())
                            .source(SourceResponse.builder()
                                    .id(ev.getSource().getId())
                                    .url(ev.getSource().getUrl())
                                    .title(ev.getSource().getTitle())
                                    .publisher(ev.getSource().getPublisher())
                                    .publicationDate(ev.getSource().getPublicationDate())
                                    .retrievedAt(ev.getSource().getRetrievedAt())
                                    .sourceMetadata(ev.getSource().getSourceMetadata())
                                    .build())
                            .build()
            ).toList();

            switch (c.getVerificationStatus()) {
                case SUPPORTED -> supported++;
                case CONTRADICTED -> contradicted++;
                case PARTIALLY_SUPPORTED -> mixed++;
                default -> insufficient++;
            }

            claimResponses.add(ClaimResponse.builder()
                    .id(c.getId())
                    .verificationRecordId(record.getId())
                    .claimText(c.getClaimText())
                    .claimType(c.getClaimType())
                    .verificationStatus(c.getVerificationStatus())
                    .statusDisplayName(c.getVerificationStatus().getDisplayName())
                    .explanation(c.getExplanation())
                    .createdAt(c.getCreatedAt())
                    .evidenceList(evidenceResponses)
                    .build());
        }

        return VerificationResponse.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .userName(record.getUser().getFullName())
                .submittedContent(record.getSubmittedContent())
                .inputType(record.getInputType())
                .originalUrl(record.getOriginalUrl())
                .processingStatus(record.getProcessingStatus())
                .overallSummary(record.getOverallSummary())
                .createdAt(record.getCreatedAt())
                .completedAt(record.getCompletedAt())
                .totalClaims(claimResponses.size())
                .supportedClaims(supported)
                .contradictedClaims(contradicted)
                .mixedClaims(mixed)
                .insufficientClaims(insufficient)
                .claims(claimResponses)
                .build();
    }
}
