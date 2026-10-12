package com.example.contentverification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextVerificationRequest {

    @NotBlank(message = "Content cannot be blank")
    @Size(min = 10, max = 50000, message = "Content length must be between 10 and 50,000 characters")
    private String text;
}
