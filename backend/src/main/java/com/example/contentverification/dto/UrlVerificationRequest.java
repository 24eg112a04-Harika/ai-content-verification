package com.example.contentverification.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlVerificationRequest {

    @NotBlank(message = "URL cannot be blank")
    @URL(message = "Must be a valid web URL")
    private String url;
}
