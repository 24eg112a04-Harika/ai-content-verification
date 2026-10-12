package com.example.contentverification.controller;

import com.example.contentverification.dto.*;
import com.example.contentverification.enums.ProcessingStatus;
import com.example.contentverification.service.AdminService;
import com.example.contentverification.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final SecurityUtils securityUtils;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getUsers() {
        List<AdminUserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UserStatusUpdateRequest request) {
        Long adminId = securityUtils.getCurrentUserId();
        AdminUserResponse updated = adminService.updateUserStatus(id, request, adminId);
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", updated));
    }

    @GetMapping("/verifications")
    public ResponseEntity<ApiResponse<List<VerificationResponse>>> getVerifications(
            @RequestParam(required = false) ProcessingStatus status,
            @RequestParam(required = false) String query) {
        List<VerificationResponse> list = adminService.getAllVerifications(status, query);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<DashboardActivityResponse>>> getActivity() {
        List<DashboardActivityResponse> activities = adminService.getAllActivityLogs();
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/sources")
    public ResponseEntity<ApiResponse<List<SourceResponse>>> getSources(
            @RequestParam(required = false) String query) {
        List<SourceResponse> sources = adminService.getAllSources(query);
        return ResponseEntity.ok(ApiResponse.ok(sources));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSystemStats() {
        DashboardSummaryResponse stats = adminService.getSystemWideSummary();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
