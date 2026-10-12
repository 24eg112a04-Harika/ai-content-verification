package com.example.contentverification.repository;

import com.example.contentverification.entity.VerificationRecord;
import com.example.contentverification.enums.ProcessingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRecordRepository extends JpaRepository<VerificationRecord, Long> {

    List<VerificationRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<VerificationRecord> findByUserId(Long userId, Pageable pageable);

    Optional<VerificationRecord> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByProcessingStatus(ProcessingStatus status);

    @Query("SELECT r FROM VerificationRecord r WHERE r.user.id = :userId " +
           "AND (:status IS NULL OR r.processingStatus = :status) " +
           "AND (:query IS NULL OR r.submittedContent LIKE CONCAT('%', :query, '%') " +
           "     OR COALESCE(r.overallSummary, '') LIKE CONCAT('%', :query, '%')) " +
           "ORDER BY r.createdAt DESC")
    List<VerificationRecord> searchUserRecords(@Param("userId") Long userId,
                                               @Param("status") ProcessingStatus status,
                                               @Param("query") String query);

    @Query("SELECT r FROM VerificationRecord r " +
           "WHERE (:status IS NULL OR r.processingStatus = :status) " +
           "AND (:query IS NULL OR r.submittedContent LIKE CONCAT('%', :query, '%') " +
           "     OR COALESCE(r.overallSummary, '') LIKE CONCAT('%', :query, '%')) " +
           "ORDER BY r.createdAt DESC")
    List<VerificationRecord> searchAllRecords(@Param("status") ProcessingStatus status,
                                               @Param("query") String query);
}
