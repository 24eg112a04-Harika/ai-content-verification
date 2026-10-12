package com.example.contentverification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardActivityResponse {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String userEmail;
    private String userName;
    private LocalDateTime createdAt;
}
