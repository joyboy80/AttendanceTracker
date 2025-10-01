-- Migration to fix ER relationships and ensure student-teacher attendance connection
-- This fixes the missing attendance_code column that prevents proper linking
-- Run this script to update existing databases

USE attendance_tracker;

-- Add missing attendance_code column if it doesn't exist
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS attendance_code VARCHAR(255);

-- Update any existing null attendance_code values with a placeholder
UPDATE attendance 
SET attendance_code = 'MIGRATED_RECORD' 
WHERE attendance_code IS NULL OR attendance_code = '';

-- Now make the column NOT NULL (after filling null values)
ALTER TABLE attendance 
MODIFY COLUMN attendance_code VARCHAR(255) NOT NULL;

-- Add performance indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_session ON attendance(studentID, sessionID);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(sessionID);
CREATE INDEX IF NOT EXISTS idx_attendance_code ON attendance(attendance_code);
CREATE INDEX IF NOT EXISTS idx_class_sessions_course_active ON class_sessions(courseCode, is_active, status);
CREATE INDEX IF NOT EXISTS idx_class_sessions_access_code ON class_sessions(access_code);

-- Verify the schema is correct
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'attendance_tracker' 
  AND TABLE_NAME = 'attendance' 
ORDER BY ORDINAL_POSITION;

SELECT 'Migration completed successfully. The attendance_code column has been added.' as status;