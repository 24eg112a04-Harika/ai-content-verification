package com.example.contentverification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ContentVerificationApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContentVerificationApplication.class, args);
    }
}
