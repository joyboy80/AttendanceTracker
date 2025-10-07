-- Migration script to copy batch values from users table to students table
-- This script updates the students table batch field with corresponding values from users table

USE attendance_tracker;

-- Backup existing students table data before migration
CREATE TABLE IF NOT EXISTS students_backup AS SELECT * FROM students;

-- Update students table batch field with values from users table
-- This copies batch from users table to students table for matching userIDs
UPDATE students s
INNER JOIN users u ON s.studentID = u.userID
SET s.batch = u.batch
WHERE u.role = 'STUDENT'
  AND u.batch IS NOT NULL
  AND u.batch != '';

-- Verify the update by showing count of updated records
SELECT 
    'Total students' as description,
    COUNT(*) as count
FROM students
UNION ALL
SELECT 
    'Students with batch from users table' as description,
    COUNT(*) as count
FROM students s
INNER JOIN users u ON s.studentID = u.userID
WHERE s.batch = u.batch
  AND u.role = 'STUDENT'
  AND u.batch IS NOT NULL
  AND u.batch != ''
UNION ALL
SELECT 
    'Students still with null/empty batch' as description,
    COUNT(*) as count
FROM students
WHERE batch IS NULL OR batch = '';

-- Show sample data after migration
SELECT 
    s.studentID,
    u.username,
    u.name,
    u.batch as user_batch,
    s.batch as student_batch,
    CASE 
        WHEN s.batch = u.batch THEN 'SYNCED' 
        WHEN s.batch IS NULL OR s.batch = '' THEN 'NULL/EMPTY'
        ELSE 'DIFFERENT' 
    END as sync_status
FROM students s
INNER JOIN users u ON s.studentID = u.userID
WHERE u.role = 'STUDENT'
ORDER BY s.studentID
LIMIT 20;

-- Create a trigger to automatically sync batch values going forward
DELIMITER //
CREATE TRIGGER sync_user_batch_to_student_after_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'STUDENT' AND NEW.batch != OLD.batch THEN
        UPDATE students 
        SET batch = NEW.batch 
        WHERE studentID = NEW.userID;
    END IF;
END//

CREATE TRIGGER sync_user_batch_to_student_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'STUDENT' AND NEW.batch IS NOT NULL THEN
        UPDATE students 
        SET batch = NEW.batch 
        WHERE studentID = NEW.userID;
    END IF;
END//
DELIMITER ;

-- Final verification query
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_students_synced
FROM students s
INNER JOIN users u ON s.studentID = u.userID
WHERE s.batch = u.batch
  AND u.role = 'STUDENT'
  AND u.batch IS NOT NULL
  AND u.batch != '';