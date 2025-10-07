-- Complete database setup for GPS location verification
-- This script ensures all required tables and columns exist

USE attendance_db;

-- First, let's check if the location columns exist in class_sessions table
SET @table_exists = 0;
SELECT COUNT(*)
INTO @table_exists
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'attendance_db' 
AND TABLE_NAME = 'class_sessions' 
AND COLUMN_NAME = 'teacher_latitude';

-- Add location columns if they don't exist
SET @sql = CASE 
    WHEN @table_exists = 0 THEN 
        'ALTER TABLE class_sessions 
         ADD COLUMN teacher_latitude DECIMAL(10, 8),
         ADD COLUMN teacher_longitude DECIMAL(11, 8),
         ADD COLUMN location VARCHAR(255);'
    ELSE 'SELECT "Location columns already exist" AS status;'
END;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure proper data types for location columns
ALTER TABLE class_sessions MODIFY COLUMN teacher_latitude DECIMAL(10, 8) NULL;
ALTER TABLE class_sessions MODIFY COLUMN teacher_longitude DECIMAL(11, 8) NULL;
ALTER TABLE class_sessions MODIFY COLUMN location VARCHAR(255) NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_class_sessions_location ON class_sessions(teacher_latitude, teacher_longitude);
CREATE INDEX IF NOT EXISTS idx_class_sessions_active_code ON class_sessions(access_code, is_active);

-- Show current table structure
DESCRIBE class_sessions;

-- Test data insertion to verify location columns work
INSERT INTO class_sessions (
    courseCode, 
    scheduled_time, 
    duration, 
    access_code, 
    expiry_time, 
    status, 
    is_active,
    teacher_name,
    teacher_username,
    teacher_latitude,
    teacher_longitude,
    location
) VALUES (
    'TEST_GPS', 
    NOW(), 
    120, 
    'TEST123GPS', 
    DATE_ADD(NOW(), INTERVAL 120 SECOND), 
    'ACTIVE', 
    TRUE,
    'GPS Test Teacher',
    'gps_teacher',
    40.7589,
    -73.9851,
    'GPS Test Classroom'
);

-- Verify the test data was inserted with location
SELECT 
    sessionID,
    courseCode,
    access_code,
    teacher_latitude,
    teacher_longitude,
    location,
    is_active
FROM class_sessions 
WHERE courseCode = 'TEST_GPS'
ORDER BY sessionID DESC 
LIMIT 1;

-- Clean up test data
DELETE FROM class_sessions WHERE courseCode = 'TEST_GPS';

SELECT "GPS location setup completed successfully!" AS result;