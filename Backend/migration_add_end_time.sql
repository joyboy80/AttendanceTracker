-- Migration to add endTime column to routines table
-- This adds the ability to store both start time and end time for classes

USE attendance_tracker;

-- Add endTime column to routines table
ALTER TABLE routines 
ADD COLUMN endTime TIME NOT NULL DEFAULT '00:00';

-- Update existing records with a default end time (1 hour after start time)
-- You may want to update these manually based on actual class durations
UPDATE routines 
SET endTime = ADDTIME(courseTime, '01:00:00')
WHERE endTime = '00:00:00';

-- Verify the changes
SELECT 
    routineID,
    courseTime as startTime,
    endTime,
    day,
    studentBatch
FROM routines 
ORDER BY routineID;

-- Optional: Add a check constraint to ensure endTime is after courseTime
-- ALTER TABLE routines 
-- ADD CONSTRAINT chk_end_time_after_start_time 
-- CHECK (endTime > courseTime);

COMMIT;