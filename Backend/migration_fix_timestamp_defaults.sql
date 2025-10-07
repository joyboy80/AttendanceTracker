-- Alternative migration script for attendance_credentials table
-- This version ensures timestamp defaults work properly in MySQL

-- Set SQL mode to ensure timestamp defaults work
SET sql_mode = '';

-- Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS attendance_credentials;

-- Create attendance_credentials table with explicit timestamp handling
CREATE TABLE attendance_credentials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    credential_id VARCHAR(512) NOT NULL UNIQUE,
    public_key LONGBLOB NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(userID) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, active),
    INDEX idx_credential_id (credential_id)
) ENGINE=InnoDB;

-- Add table comment
ALTER TABLE attendance_credentials COMMENT = 'Stores WebAuthn credentials for fingerprint-based attendance verification';

-- Verify table structure
DESCRIBE attendance_credentials;