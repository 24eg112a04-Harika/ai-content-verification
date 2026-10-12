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
public class SourceResponse {
    private Long id;
    private String url;
    private String title;
    private String publisher;
    private String publicationDate;
    private LocalDateTime retrievedAt;
    private String sourceMetadata;
}
