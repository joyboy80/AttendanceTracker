-- Migration to add photo column to users table
-- Run this SQL script on your MySQL database

USE attendance_tracker;

-- Check if photo column exists and add it if it doesn't
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'attendance_tracker' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'photo';

-- Add photo column only if it doesn't exist
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN photo VARCHAR(500) DEFAULT NULL COMMENT ''Profile photo path or URL for the user''', 
    'SELECT ''Photo column already exists'' AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the change
DESCRIBE users;

-- Check current users and their photo status
SELECT userID, username, name, email, photo, 
       CASE 
           WHEN photo IS NULL THEN 'No photo' 
           ELSE 'Has photo' 
       END AS photo_status 
FROM users 
ORDER BY userID 
LIMIT 10;

-- Show column information specifically for photo
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'attendance_tracker' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'photo';