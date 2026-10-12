package com.example.contentverification.dto;

import com.example.contentverification.enums.AccountStatus;
import com.example.contentverification.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusUpdateRequest {
    private AccountStatus status;
    private Role role;
}
