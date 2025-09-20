-- Migration to add isActive and remainingTime columns to class_sessions table
ALTER TABLE class_sessions 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN remaining_time INTEGER NULL;

-- Update existing active sessions to have is_active = true
UPDATE class_sessions 
SET is_active = TRUE 
WHERE status = 'ACTIVE';

-- Set is_active = false for ended sessions
UPDATE class_sessions 
SET is_active = FALSE 
WHERE status = 'ENDED';