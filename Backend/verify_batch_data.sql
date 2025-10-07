-- Verification script to check batch data in users and students tables
-- Use this to verify the batch data before and after migration

USE attendance_tracker;

-- Check current batch data distribution in users table
SELECT 
    'USERS TABLE - Batch Distribution' as table_info,
    batch,
    COUNT(*) as count,
    role
FROM users 
WHERE role = 'STUDENT'
GROUP BY batch, role
ORDER BY batch;

-- Check current batch data distribution in students table
SELECT 
    'STUDENTS TABLE - Batch Distribution' as table_info,
    COALESCE(batch, 'NULL/EMPTY') as batch,
    COUNT(*) as count
FROM students
GROUP BY batch
ORDER BY batch;

-- Compare batch data between users and students tables
SELECT 
    s.studentID,
    u.username,
    u.name,
    u.batch as user_batch,
    s.batch as student_batch,
    CASE 
        WHEN u.batch IS NULL AND s.batch IS NULL THEN 'BOTH_NULL'
        WHEN u.batch = s.batch THEN 'MATCHED'
        WHEN u.batch IS NOT NULL AND (s.batch IS NULL OR s.batch = '') THEN 'STUDENT_NULL'
        WHEN s.batch IS NOT NULL AND (u.batch IS NULL OR u.batch = '') THEN 'USER_NULL'
        ELSE 'DIFFERENT'
    END as comparison_status
FROM students s
INNER JOIN users u ON s.studentID = u.userID
WHERE u.role = 'STUDENT'
ORDER BY comparison_status, s.studentID;

-- Summary statistics
SELECT 
    'Summary Statistics' as info,
    SUM(CASE WHEN u.batch = s.batch THEN 1 ELSE 0 END) as matched_batches,
    SUM(CASE WHEN u.batch IS NOT NULL AND (s.batch IS NULL OR s.batch = '') THEN 1 ELSE 0 END) as students_need_update,
    SUM(CASE WHEN (u.batch IS NULL OR u.batch = '') AND s.batch IS NOT NULL THEN 1 ELSE 0 END) as users_missing_batch,
    COUNT(*) as total_student_records
FROM students s
INNER JOIN users u ON s.studentID = u.userID
WHERE u.role = 'STUDENT';