package com.example.contentverification.dto;

import com.example.contentverification.enums.AccountStatus;
import com.example.contentverification.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private AccountStatus accountStatus;
    private LocalDateTime createdAt;
    private long totalVerifications;
}
