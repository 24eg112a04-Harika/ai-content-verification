package com.example.contentverification.repository;

import com.example.contentverification.entity.Claim;
import com.example.contentverification.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByVerificationRecordIdOrderByCreatedAtAsc(Long verificationRecordId);

    long countByVerificationStatus(VerificationStatus status);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.verificationRecord.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.verificationRecord.user.id = :userId AND c.verificationStatus = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") VerificationStatus status);

    @Query("SELECT c.verificationStatus, COUNT(c) FROM Claim c WHERE c.verificationRecord.user.id = :userId GROUP BY c.verificationStatus")
    List<Object[]> countStatusGroupsByUserId(@Param("userId") Long userId);

    @Query("SELECT c.verificationStatus, COUNT(c) FROM Claim c GROUP BY c.verificationStatus")
    List<Object[]> countStatusGroupsAll();
}
