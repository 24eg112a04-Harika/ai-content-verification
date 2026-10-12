-- V1__init_schema.sql: Initial database schema for Content Verification System

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS verification_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    submitted_content LONGTEXT NOT NULL,
    input_type VARCHAR(20) NOT NULL,
    original_url VARCHAR(1000) NULL,
    processing_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    overall_summary TEXT NULL,
    created_at DATETIME NOT NULL,
    completed_at DATETIME NULL,
    CONSTRAINT fk_record_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_vr_user_id ON verification_records(user_id);
CREATE INDEX idx_vr_status ON verification_records(processing_status);

CREATE TABLE IF NOT EXISTS claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    verification_record_id BIGINT NOT NULL,
    claim_text TEXT NOT NULL,
    claim_type VARCHAR(50) NOT NULL DEFAULT 'FACTUAL',
    verification_status VARCHAR(60) NOT NULL DEFAULT 'INSUFFICIENT_EVIDENCE',
    explanation TEXT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_claim_record FOREIGN KEY (verification_record_id) REFERENCES verification_records(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_claims_record ON claims(verification_record_id);
CREATE INDEX idx_claims_status ON claims(verification_status);

CREATE TABLE IF NOT EXISTS sources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(500) NOT NULL,
    publisher VARCHAR(255) NULL,
    publication_date VARCHAR(50) NULL,
    retrieved_at DATETIME NOT NULL,
    source_metadata TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sources_publisher ON sources(publisher);

CREATE TABLE IF NOT EXISTS evidence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    source_id BIGINT NOT NULL,
    evidence_type VARCHAR(30) NOT NULL,
    evidence_excerpt TEXT NOT NULL,
    relevance_score DOUBLE DEFAULT 0.0,
    explanation TEXT NULL,
    CONSTRAINT fk_evidence_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
    CONSTRAINT fk_evidence_source FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_evidence_claim ON evidence(claim_id);
CREATE INDEX idx_evidence_source ON evidence(source_id);

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at);
