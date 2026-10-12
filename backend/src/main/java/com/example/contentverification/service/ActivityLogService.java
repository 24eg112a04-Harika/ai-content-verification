package com.example.contentverification.service;

import com.example.contentverification.entity.ActivityLog;
import com.example.contentverification.entity.User;
import com.example.contentverification.repository.ActivityLogRepository;
import com.example.contentverification.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logActivity(Long userId, String action, String entityType, Long entityId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .build();

        activityLogRepository.save(log);
    }
}
