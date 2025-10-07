-- STEP 1: Run this SQL to add the photo column
USE attendance_tracker;

-- Check if photo column exists
SELECT COUNT(*) as column_exists
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'attendance_tracker' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'photo';

-- Add photo column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo VARCHAR(500) DEFAULT NULL 
COMMENT 'Profile photo path or URL for the user';

-- Verify the column was added
DESCRIBE users;