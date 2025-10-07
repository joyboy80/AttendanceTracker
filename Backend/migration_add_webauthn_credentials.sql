-- Migration to add attendance_credentials table for WebAuthn fingerprint verification
-- This table stores WebAuthn credentials for fingerprint-based attendance marking

-- Create attendance_credentials table
CREATE TABLE IF NOT EXISTS attendance_credentials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    credential_id VARCHAR(512) NOT NULL UNIQUE,
    public_key LONGBLOB NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userID) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, active),
    INDEX idx_credential_id (credential_id)
);

-- Add comment to table
ALTER TABLE attendance_credentials COMMENT = 'Stores WebAuthn credentials for fingerprint-based attendance verification';