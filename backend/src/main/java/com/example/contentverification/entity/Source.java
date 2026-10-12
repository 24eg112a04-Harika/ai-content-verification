package com.example.contentverification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Source {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 255)
    private String publisher;

    @Column(name = "publication_date", length = 50)
    private String publicationDate;

    @CreationTimestamp
    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    /**
     * Actual retrieved text snippet for the source. Used by the evidence
     * comparison engine to score relevance. Metadata JSON is not suitable
     * for text similarity scoring.
     */
    @Column(name = "content_excerpt", columnDefinition = "TEXT")
    private String contentExcerpt;

    @Column(name = "source_metadata", columnDefinition = "TEXT")
    private String sourceMetadata;
}
