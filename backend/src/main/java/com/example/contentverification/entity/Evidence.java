package com.example.contentverification.entity;

import com.example.contentverification.enums.EvidenceType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "source_id", nullable = false)
    private Source source;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_type", nullable = false, length = 30)
    private EvidenceType evidenceType;

    @Column(name = "evidence_excerpt", nullable = false, columnDefinition = "TEXT")
    private String evidenceExcerpt;

    @Column(name = "relevance_score")
    private Double relevanceScore;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
