package com.example.contentverification.controller;

import com.example.contentverification.dto.ApiResponse;
import com.example.contentverification.dto.ClaimResponse;
import com.example.contentverification.dto.EvidenceResponse;
import com.example.contentverification.dto.SourceResponse;
import com.example.contentverification.entity.Claim;
import com.example.contentverification.entity.Evidence;
import com.example.contentverification.exception.ResourceNotFoundException;
import com.example.contentverification.exception.UnauthorizedException;
import com.example.contentverification.repository.ClaimRepository;
import com.example.contentverification.repository.EvidenceRepository;
import com.example.contentverification.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimRepository claimRepository;
    private final EvidenceRepository evidenceRepository;
    private final SecurityUtils securityUtils;

    @GetMapping("/verifications/{id}/claims")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getClaimsByVerificationRecord(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        boolean isAdmin = securityUtils.isAdmin();

        List<Claim> claims = claimRepository.findByVerificationRecordIdOrderByCreatedAtAsc(id);
        if (!claims.isEmpty()) {
            Claim first = claims.get(0);
            if (!isAdmin && !first.getVerificationRecord().getUser().getId().equals(userId)) {
                throw new UnauthorizedException("You do not have access to these claims");
            }
        }

        List<ClaimResponse> responses = claims.stream().map(this::mapClaimToResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/claims/{claimId}")
    public ResponseEntity<ApiResponse<ClaimResponse>> getClaimById(@PathVariable Long claimId) {
        Long userId = securityUtils.getCurrentUserId();
        boolean isAdmin = securityUtils.isAdmin();

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + claimId));

        if (!isAdmin && !claim.getVerificationRecord().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this claim");
        }

        return ResponseEntity.ok(ApiResponse.ok(mapClaimToResponse(claim)));
    }

    @GetMapping("/claims/{claimId}/evidence")
    public ResponseEntity<ApiResponse<List<EvidenceResponse>>> getEvidenceByClaimId(@PathVariable Long claimId) {
        Long userId = securityUtils.getCurrentUserId();
        boolean isAdmin = securityUtils.isAdmin();

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + claimId));

        if (!isAdmin && !claim.getVerificationRecord().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this claim evidence");
        }

        List<Evidence> evidenceList = evidenceRepository.findByClaimId(claimId);
        List<EvidenceResponse> responses = evidenceList.stream().map(this::mapEvidenceToResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    private ClaimResponse mapClaimToResponse(Claim claim) {
        List<Evidence> evidenceList = evidenceRepository.findByClaimId(claim.getId());
        List<EvidenceResponse> evResponses = evidenceList.stream().map(this::mapEvidenceToResponse).toList();

        return ClaimResponse.builder()
                .id(claim.getId())
                .verificationRecordId(claim.getVerificationRecord().getId())
                .claimText(claim.getClaimText())
                .claimType(claim.getClaimType())
                .verificationStatus(claim.getVerificationStatus())
                .statusDisplayName(claim.getVerificationStatus().getDisplayName())
                .explanation(claim.getExplanation())
                .createdAt(claim.getCreatedAt())
                .evidenceList(evResponses)
                .build();
    }

    private EvidenceResponse mapEvidenceToResponse(Evidence ev) {
        return EvidenceResponse.builder()
                .id(ev.getId())
                .claimId(ev.getClaim().getId())
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
                .build();
    }
}
