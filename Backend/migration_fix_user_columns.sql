-- Migration script to fix user table column names
-- This script updates the column names from camelCase to snake_case to match JPA mapping

USE attendance_tracker;

-- Check if old columns exist and rename them
ALTER TABLE users 
CHANGE COLUMN firstName first_name VARCHAR(50) NOT NULL,
CHANGE COLUMN middleName middle_name VARCHAR(50),
CHANGE COLUMN lastName last_name VARCHAR(50) NOT NULL;

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Migration completed successfully