package com.example.contentverification.controller;

import com.example.contentverification.dto.ApiResponse;
import com.example.contentverification.dto.DashboardActivityResponse;
import com.example.contentverification.dto.DashboardSummaryResponse;
import com.example.contentverification.service.AdminService;
import com.example.contentverification.service.DashboardService;
import com.example.contentverification.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AdminService adminService;
    private final SecurityUtils securityUtils;

    @GetMapping("/api/dashboard/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        Long userId = securityUtils.getCurrentUserId();
        DashboardSummaryResponse summary = dashboardService.getUserDashboardSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/api/dashboard/activity")
    public ResponseEntity<ApiResponse<List<DashboardActivityResponse>>> getActivity() {
        Long userId = securityUtils.getCurrentUserId();
        List<DashboardActivityResponse> activities = dashboardService.getUserRecentActivity(userId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/api/public/stats")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getPublicStats() {
        // Public platform metrics for landing view
        DashboardSummaryResponse stats = adminService.getSystemWideSummary();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
