-- Verify attendance status values in database
-- This will help confirm the correct status format and fix the count issues

USE attendance_tracker;

-- Check what status values are actually stored in attendance table
SELECT 
    'Current Status Values in Attendance Table' as info,
    status,
    COUNT(*) as count
FROM attendance 
GROUP BY status
ORDER BY status;

-- Check sample attendance records with their status
SELECT 
    'Sample Attendance Records' as info,
    attendanceID,
    studentID,
    courseCode,
    status,
    timestamp
FROM attendance 
ORDER BY attendanceID DESC
LIMIT 10;

-- Verify total counts
SELECT 
    'Overall Statistics' as info,
    COUNT(*) as total_records,
    SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
    SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late_count,
    ROUND(
        (SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2
    ) as attendance_percentage
FROM attendance;

-- Check if there are any invalid status values
SELECT 
    'Invalid Status Check' as info,
    status,
    COUNT(*) as count
FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE')
GROUP BY status;

-- Update any incorrect status values (if needed)
-- Uncomment the following lines if you find lowercase values

/*
-- Fix any lowercase status values to uppercase
UPDATE attendance SET status = 'PRESENT' WHERE status = 'present' OR status = 'Present';
UPDATE attendance SET status = 'ABSENT' WHERE status = 'absent' OR status = 'Absent';
UPDATE attendance SET status = 'LATE' WHERE status = 'late' OR status = 'Late';
*/

-- Verify attendance table structure
DESCRIBE attendance;