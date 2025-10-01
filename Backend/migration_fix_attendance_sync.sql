-- Migration to fix attendance session synchronization issues
-- Run this after database_setup.sql to ensure proper schema

USE attendance_tracker;

-- Ensure class_sessions table has all required columns
ALTER TABLE class_sessions 
ADD COLUMN IF NOT EXISTS status ENUM('ACTIVE', 'ENDED', 'PAUSED') DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS remaining_time INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS teacher_username VARCHAR(50);

-- Ensure attendance table has proper schema
ALTER TABLE attendance 
MODIFY COLUMN status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL DEFAULT 'PRESENT',
ADD COLUMN IF NOT EXISTS biometric_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

-- Add index for better performance on session queries
CREATE INDEX IF NOT EXISTS idx_class_sessions_course_active ON class_sessions(courseCode, is_active, status);
CREATE INDEX IF NOT EXISTS idx_class_sessions_expiry ON class_sessions(expiryTime, is_active);

-- Add index for attendance queries
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(sessionID, studentID);
CREATE INDEX IF NOT EXISTS idx_attendance_student_course ON attendance(studentID, courseCode);

-- Clean up any duplicate or invalid sessions
UPDATE class_sessions 
SET status = 'ENDED', is_active = FALSE 
WHERE expiryTime < NOW() AND (status = 'ACTIVE' OR is_active = TRUE);

-- Ensure proper data consistency
UPDATE class_sessions 
SET is_active = FALSE 
WHERE status != 'ACTIVE';

UPDATE class_sessions 
SET status = 'ENDED' 
WHERE is_active = FALSE AND status = 'ACTIVE';