-- Add teacher information fields to class_sessions table
ALTER TABLE class_sessions 
ADD COLUMN teacher_name VARCHAR(255),
ADD COLUMN teacher_username VARCHAR(100);

-- Update any existing sessions with default values if needed
-- (This step might not be necessary in a development environment)
-- UPDATE class_sessions SET teacher_name = 'Unknown Teacher', teacher_username = 'unknown' WHERE teacher_name IS NULL;