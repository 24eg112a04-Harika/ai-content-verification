package com.example.contentverification.entity;

import com.example.contentverification.enums.ClaimType;
import com.example.contentverification.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "verification_record_id", nullable = false)
    private VerificationRecord verificationRecord;

    @Column(name = "claim_text", nullable = false, columnDefinition = "TEXT")
    private String claimText;

    @Enumerated(EnumType.STRING)
    @Column(name = "claim_type", nullable = false, length = 50)
    private ClaimType claimType;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 60)
    private VerificationStatus verificationStatus;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Evidence> evidenceList = new ArrayList<>();
}
