-- Migration to add status and end_time columns to class_sessions table
ALTER TABLE class_sessions 
ADD COLUMN status VARCHAR(10) DEFAULT 'ACTIVE',
ADD COLUMN end_time TIMESTAMP NULL;

-- Update existing sessions to have ENDED status if they are past expiry
UPDATE class_sessions 
SET status = 'ENDED' 
WHERE expiry_time IS NOT NULL AND expiry_time < NOW();

-- Set default status to ACTIVE for sessions that are still within expiry time
UPDATE class_sessions 
SET status = 'ACTIVE' 
WHERE expiry_time IS NOT NULL AND expiry_time >= NOW() AND status IS NULL;