package com.example.contentverification.controller;

import com.example.contentverification.dto.*;
import com.example.contentverification.enums.ProcessingStatus;
import com.example.contentverification.service.VerificationService;
import com.example.contentverification.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/verifications")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;
    private final SecurityUtils securityUtils;

    @PostMapping("/text")
    public ResponseEntity<ApiResponse<VerificationResponse>> submitText(@Valid @RequestBody TextVerificationRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        VerificationResponse response = verificationService.submitTextVerification(userId, request);
        return new ResponseEntity<>(ApiResponse.ok("Text submitted for verification", response), HttpStatus.ACCEPTED);
    }

    @PostMapping("/url")
    public ResponseEntity<ApiResponse<VerificationResponse>> submitUrl(@Valid @RequestBody UrlVerificationRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        VerificationResponse response = verificationService.submitUrlVerification(userId, request);
        return new ResponseEntity<>(ApiResponse.ok("URL submitted for verification", response), HttpStatus.ACCEPTED);
    }

    @PostMapping(value = "/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<VerificationResponse>> submitFile(@RequestParam("file") MultipartFile file) {
        Long userId = securityUtils.getCurrentUserId();
        VerificationResponse response = verificationService.submitFileVerification(userId, file);
        return new ResponseEntity<>(ApiResponse.ok("File submitted for verification", response), HttpStatus.ACCEPTED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VerificationResponse>> getById(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        boolean isAdmin = securityUtils.isAdmin();
        VerificationResponse response = verificationService.getVerificationById(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<VerificationStatusResponse>> getStatus(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        boolean isAdmin = securityUtils.isAdmin();
        VerificationStatusResponse response = verificationService.getVerificationStatus(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VerificationResponse>>> getHistory(
            @RequestParam(required = false) ProcessingStatus status,
            @RequestParam(required = false) String query) {
        Long userId = securityUtils.getCurrentUserId();
        List<VerificationResponse> history = verificationService.getUserVerifications(userId, status, query);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        boolean isAdmin = securityUtils.isAdmin();
        verificationService.deleteVerification(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Verification record deleted successfully", null));
    }
}
