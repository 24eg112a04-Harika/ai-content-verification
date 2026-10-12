package com.example.contentverification.config;

import com.example.contentverification.entity.*;
import com.example.contentverification.enums.*;
import com.example.contentverification.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final VerificationRecordRepository verificationRecordRepository;
    private final ClaimRepository claimRepository;
    private final SourceRepository sourceRepository;
    private final EvidenceRepository evidenceRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-demo-data:true}")
    private boolean seedDemoData;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            logger.info("Demo data seeding is disabled (app.seed-demo-data=false). Skipping.");
            return;
        }

        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial data population.");
            return;
        }

        logger.info("Seeding initial administrator, user accounts, and verification records...");

        // 1. Seed Admin
        User admin = User.builder()
                .fullName("System Administrator")
                .email("admin@verification.org")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role(Role.ROLE_ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        admin = userRepository.save(admin);

        // 2. Seed Analyst User
        User analyst = User.builder()
                .fullName("Research Analyst")
                .email("analyst@verification.org")
                .passwordHash(passwordEncoder.encode("Analyst@123"))
                .role(Role.ROLE_USER)
                .accountStatus(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        analyst = userRepository.save(analyst);

        // 3. Seed Example Verification Record (from Prompt Page 3)
        String sampleText = "India launched Chandrayaan-3 in 2023. The mission successfully landed near the Moon's south polar region.";
        VerificationRecord record = VerificationRecord.builder()
                .user(analyst)
                .submittedContent(sampleText)
                .inputType(InputType.TEXT)
                .processingStatus(ProcessingStatus.COMPLETED)
                .overallSummary("Verification analyzed 2 statements: 2 supported by available documentation, 0 contradicted, 0 mixed, and 0 with insufficient evidence.")
                .createdAt(LocalDateTime.now().minusHours(2))
                .completedAt(LocalDateTime.now().minusHours(2).plusSeconds(4))
                .build();
        record = verificationRecordRepository.save(record);

        // 4. Sources
        Source isroSource = Source.builder()
                .url("https://www.isro.gov.in/Chandrayaan3.html")
                .title("ISRO Official Release: Chandrayaan-3 Mission Profile")
                .publisher("Indian Space Research Organisation (ISRO)")
                .publicationDate("2023-08-23")
                .retrievedAt(LocalDateTime.now().minusHours(2))
                .contentExcerpt("Chandrayaan-3 is a follow-on mission to Chandrayaan-2 to demonstrate end-to-end capability in safe landing and roving on the lunar surface. Launched on 14 July 2023.")
                .sourceMetadata("{\"organization\":\"ISRO\",\"verification_confidence\":\"authoritative\"}")
                .build();
        isroSource = sourceRepository.save(isroSource);

        Source natureSource = Source.builder()
                .url("https://www.nature.com/articles/d41586-023-02690-0")
                .title("India makes historic Moon landing near south pole")
                .publisher("Nature Journal")
                .publicationDate("2023-08-23")
                .retrievedAt(LocalDateTime.now().minusHours(2))
                .contentExcerpt("The Chandrayaan-3 spacecraft touched down in the unexplored lunar south polar zone, making India the fourth nation to land on the Moon and the first near the lunar south pole.")
                .sourceMetadata("{\"type\":\"peer_reviewed_press\",\"doi\":\"10.1038/d41586-023-02690-0\"}")
                .build();
        natureSource = sourceRepository.save(natureSource);

        // 5. Claims & Evidence
        // Claim 1
        Claim claim1 = Claim.builder()
                .verificationRecord(record)
                .claimText("India launched Chandrayaan-3 in 2023.")
                .claimType(ClaimType.FACTUAL)
                .verificationStatus(VerificationStatus.SUPPORTED)
                .explanation("Multiple independent space agency bulletins and international records confirm that Chandrayaan-3 was launched on July 14, 2023 from Satish Dhawan Space Centre.")
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();
        claim1 = claimRepository.save(claim1);

        Evidence ev1 = Evidence.builder()
                .claim(claim1)
                .source(isroSource)
                .evidenceType(EvidenceType.SUPPORTING)
                .evidenceExcerpt("Chandrayaan-3 is a follow-on mission to Chandrayaan-2 to demonstrate end-to-end capability in safe landing and roving on the lunar surface. Launched on 14 July 2023.")
                .relevanceScore(0.95)
                .explanation("ISRO documentation directly confirms the 2023 launch milestone.")
                .build();
        evidenceRepository.save(ev1);

        // Claim 2
        Claim claim2 = Claim.builder()
                .verificationRecord(record)
                .claimText("The mission successfully landed near the Moon's south polar region.")
                .claimType(ClaimType.FACTUAL)
                .verificationStatus(VerificationStatus.SUPPORTED)
                .explanation("Telemetry data confirmed the soft landing of Vikram lander at 69.37°S, 32.35°E near the lunar south pole on August 23, 2023.")
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();
        claim2 = claimRepository.save(claim2);

        Evidence ev2 = Evidence.builder()
                .claim(claim2)
                .source(natureSource)
                .evidenceType(EvidenceType.SUPPORTING)
                .evidenceExcerpt("The Chandrayaan-3 spacecraft touched down in the unexplored lunar south polar zone, making India the fourth nation to land on the Moon and the first near the lunar south pole.")
                .relevanceScore(0.92)
                .explanation("International peer-reviewed journal confirms touchdown coordinates in the lunar south polar zone.")
                .build();
        evidenceRepository.save(ev2);

        // 6. Activity logs
        activityLogRepository.save(ActivityLog.builder()
                .user(analyst)
                .action("SUBMIT_TEXT_VERIFICATION")
                .entityType("VerificationRecord")
                .entityId(record.getId())
                .createdAt(LocalDateTime.now().minusHours(2))
                .build());

        logger.info("Initial data successfully seeded. Admin: admin@verification.org, Analyst: analyst@verification.org");
    }
}
