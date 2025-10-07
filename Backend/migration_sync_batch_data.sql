-- Migration script to synchronize batch data between users and students tables
-- This ensures batch consistency and proper relationships

USE attendance_tracker;

-- Step 1: Update students table batch to match users table batch
-- This ensures both tables have the same batch information
UPDATE students s 
JOIN users u ON s.studentID = u.userID 
SET s.batch = u.batch 
WHERE u.role = 'STUDENT' AND u.batch IS NOT NULL;

-- Step 2: Update users table batch from students table for any missing data
-- This handles cases where students table has batch but users table doesn't
UPDATE users u 
JOIN students s ON u.userID = s.studentID 
SET u.batch = s.batch 
WHERE u.role = 'STUDENT' AND (u.batch IS NULL OR u.batch = '') AND s.batch IS NOT NULL;

-- Step 3: Create a trigger to keep batch data synchronized
-- When users.batch is updated, automatically update students.batch
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS sync_batch_users_to_students 
AFTER UPDATE ON users 
FOR EACH ROW 
BEGIN 
    IF NEW.batch != OLD.batch AND NEW.role = 'STUDENT' THEN
        UPDATE students 
        SET batch = NEW.batch 
        WHERE studentID = NEW.userID;
    END IF;
END$$

-- Step 4: Create reverse trigger to sync from students to users
-- When students.batch is updated, automatically update users.batch
CREATE TRIGGER IF NOT EXISTS sync_batch_students_to_users 
AFTER UPDATE ON students 
FOR EACH ROW 
BEGIN 
    IF NEW.batch != OLD.batch THEN
        UPDATE users 
        SET batch = NEW.batch 
        WHERE userID = NEW.studentID AND role = 'STUDENT';
    END IF;
END$$

-- Step 5: Create trigger for new student insertions
-- Ensure batch is synchronized when new students are created
CREATE TRIGGER IF NOT EXISTS sync_batch_on_student_insert 
AFTER INSERT ON students 
FOR EACH ROW 
BEGIN 
    UPDATE users 
    SET batch = NEW.batch 
    WHERE userID = NEW.studentID AND role = 'STUDENT' AND (batch IS NULL OR batch = '');
END$$

DELIMITER ;

-- Step 6: Verify the synchronization
SELECT 
    u.userID,
    u.username,
    u.first_name,
    u.last_name,
    u.batch as user_batch,
    s.batch as student_batch,
    CASE 
        WHEN u.batch = s.batch THEN 'SYNCED'
        WHEN u.batch IS NULL AND s.batch IS NOT NULL THEN 'USER_MISSING'
        WHEN u.batch IS NOT NULL AND s.batch IS NULL THEN 'STUDENT_MISSING'
        ELSE 'MISMATCH'
    END as sync_status
FROM users u
JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT'
ORDER BY sync_status, u.batch;

-- Step 7: Show batch statistics
SELECT 
    'Total Students' as metric,
    COUNT(*) as count
FROM users u
JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT'

UNION ALL

SELECT 
    'Students with Batch (Users)' as metric,
    COUNT(*) as count
FROM users u
JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT' AND u.batch IS NOT NULL AND u.batch != ''

UNION ALL

SELECT 
    'Students with Batch (Students)' as metric,
    COUNT(*) as count
FROM users u
JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT' AND s.batch IS NOT NULL AND s.batch != ''

UNION ALL

SELECT 
    'Synchronized Batches' as metric,
    COUNT(*) as count
FROM users u
JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT' AND u.batch = s.batch AND u.batch IS NOT NULL;

-- Step 8: List all unique batches
SELECT DISTINCT 
    COALESCE(u.batch, s.batch) as batch_name,
    COUNT(*) as student_count
FROM users u
JOIN students s ON u.userID = s.studentID
WHERE u.role = 'STUDENT' 
  AND (u.batch IS NOT NULL OR s.batch IS NOT NULL)
GROUP BY COALESCE(u.batch, s.batch)
ORDER BY batch_name;