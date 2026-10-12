package com.example.contentverification.repository;

import com.example.contentverification.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop15ByOrderByCreatedAtDesc();

    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
