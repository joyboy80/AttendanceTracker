-- Migration to add teacher location fields to class_sessions table
-- This enables GPS-based location verification for attendance

-- Add teacher location fields to class_sessions table
ALTER TABLE class_sessions 
ADD COLUMN teacher_latitude DECIMAL(10, 8),
ADD COLUMN teacher_longitude DECIMAL(11, 8),
ADD COLUMN location VARCHAR(255);

-- Add comment to describe the new fields
ALTER TABLE class_sessions COMMENT = 'Class sessions with teacher location data for GPS verification';

-- Add indexes for location queries (optional for performance)
CREATE INDEX idx_class_sessions_location ON class_sessions(teacher_latitude, teacher_longitude);
CREATE INDEX idx_class_sessions_active_code ON class_sessions(access_code, is_active);

-- Verify table structure
DESCRIBE class_sessions;