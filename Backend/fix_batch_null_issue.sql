-- Fix batch data synchronization and ensure users table batch is used
-- This script addresses the issue where students.batch is null

USE attendance_tracker;

-- Step 1: Check current state
SELECT 'Current State Analysis' as step;

-- Check users table batch data
SELECT 
    'Users Table Batch Data' as table_name,
    COUNT(*) as total_students,
    COUNT(batch) as students_with_batch,
    COUNT(*) - COUNT(batch) as students_without_batch
FROM users 
WHERE role = 'STUDENT';

-- Check students table batch data  
SELECT 
    'Students Table Batch Data' as table_name,
    COUNT(*) as total_records,
    COUNT(batch) as records_with_batch,
    COUNT(*) - COUNT(batch) as records_without_batch
FROM students;

-- Show sample data to understand the issue
SELECT 
    u.userID,
    u.username,
    u.first_name,
    u.last_name,
    u.batch as user_batch,
    s.batch as student_batch,
    s.department
FROM users u
LEFT JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT'
LIMIT 10;

-- Step 2: Update students table with batch from users table
SELECT 'Synchronizing batch data from users to students' as step;

UPDATE students s 
JOIN users u ON s.studentID = u.userID 
SET s.batch = u.batch 
WHERE u.role = 'STUDENT' AND u.batch IS NOT NULL;

-- Step 3: For any users without batch, try to get it from students table
SELECT 'Synchronizing batch data from students to users' as step;

UPDATE users u 
JOIN students s ON u.userID = s.studentID 
SET u.batch = s.batch 
WHERE u.role = 'STUDENT' AND (u.batch IS NULL OR u.batch = '') AND s.batch IS NOT NULL;

-- Step 4: Show results after synchronization
SELECT 'Post-Synchronization Analysis' as step;

SELECT 
    u.userID,
    u.username,
    u.first_name,
    u.last_name,
    u.batch as user_batch,
    s.batch as student_batch,
    CASE 
        WHEN u.batch = s.batch THEN 'SYNCED'
        WHEN u.batch IS NOT NULL AND s.batch IS NULL THEN 'STUDENT_MISSING'
        WHEN u.batch IS NULL AND s.batch IS NOT NULL THEN 'USER_MISSING'
        WHEN u.batch != s.batch THEN 'MISMATCH'
        ELSE 'BOTH_NULL'
    END as sync_status
FROM users u
LEFT JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT'
ORDER BY sync_status, u.batch;

-- Step 5: Create or replace triggers for automatic synchronization
DROP TRIGGER IF EXISTS sync_batch_users_to_students;
DROP TRIGGER IF EXISTS sync_batch_students_to_users;

DELIMITER $$

-- Trigger to sync from users to students
CREATE TRIGGER sync_batch_users_to_students
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'STUDENT' AND (NEW.batch != OLD.batch OR (NEW.batch IS NOT NULL AND OLD.batch IS NULL)) THEN
        UPDATE students 
        SET batch = NEW.batch 
        WHERE studentID = NEW.userID;
    END IF;
END$$

-- Trigger to sync from students to users (only if users.batch is null)
CREATE TRIGGER sync_batch_students_to_users
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
    IF NEW.batch != OLD.batch OR (NEW.batch IS NOT NULL AND OLD.batch IS NULL) THEN
        UPDATE users 
        SET batch = NEW.batch 
        WHERE userID = NEW.studentID AND role = 'STUDENT' AND (batch IS NULL OR batch = '');
    END IF;
END$$

DELIMITER ;

-- Step 6: Show final statistics
SELECT 
    'Final Statistics' as summary,
    COUNT(*) as total_students,
    SUM(CASE WHEN u.batch IS NOT NULL AND u.batch != '' THEN 1 ELSE 0 END) as users_with_batch,
    SUM(CASE WHEN s.batch IS NOT NULL AND s.batch != '' THEN 1 ELSE 0 END) as students_with_batch,
    SUM(CASE WHEN u.batch = s.batch AND u.batch IS NOT NULL THEN 1 ELSE 0 END) as synced_batches
FROM users u
LEFT JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT';

-- Step 7: Show all unique batches
SELECT 
    COALESCE(u.batch, s.batch) as batch_name,
    COUNT(*) as student_count,
    'Active' as status
FROM users u
LEFT JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT' 
  AND (u.batch IS NOT NULL AND u.batch != '')
GROUP BY COALESCE(u.batch, s.batch)
ORDER BY batch_name;