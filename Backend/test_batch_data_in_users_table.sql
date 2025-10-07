-- Test query to verify batch data in users table for attendance overview
-- This will show the batch data that should be available for the attendance overview feature

USE attendance_tracker;

-- Check what batch values are currently in users table for students
SELECT 
    'Current Batch Values in Users Table' as info,
    batch,
    COUNT(*) as student_count,
    GROUP_CONCAT(DISTINCT username ORDER BY username) as students
FROM users 
WHERE role = 'STUDENT' 
  AND batch IS NOT NULL 
  AND batch != ''
GROUP BY batch
ORDER BY 
    CASE 
        WHEN batch REGEXP '^[0-9]+$' THEN CAST(batch AS UNSIGNED)
        ELSE 9999 
    END,
    batch;

-- Show sample students with their batch information from users table
SELECT 
    'Sample Student Batch Data' as info,
    userID,
    username,
    CONCAT(first_name, ' ', last_name) as full_name,
    batch,
    role,
    created_at
FROM users 
WHERE role = 'STUDENT' 
ORDER BY 
    CASE 
        WHEN batch REGEXP '^[0-9]+$' THEN CAST(batch AS UNSIGNED)
        ELSE 9999 
    END,
    batch,
    username
LIMIT 20;

-- Check if we need to add batch data for batches 19-30
SELECT 
    'Missing Batch Analysis' as info,
    batch_number,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM users 
            WHERE role = 'STUDENT' 
              AND batch = CAST(batch_number AS CHAR)
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (
    SELECT 19 as batch_number UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
    UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28
    UNION SELECT 29 UNION SELECT 30
) as batch_range
ORDER BY batch_number;

-- Quick insert statement to add sample students for missing batches (commented out)
-- Uncomment and modify as needed to add test data

/*
-- Insert sample students for batches 19-30 (if needed for testing)
INSERT INTO users (name, first_name, last_name, username, password, role, batch, email) VALUES
('Student Nineteen', 'Student', 'Nineteen', 'student19', '$2a$10$hashedpassword', 'STUDENT', '19', 'student19@university.edu'),
('Student Twenty', 'Student', 'Twenty', 'student20', '$2a$10$hashedpassword', 'STUDENT', '20', 'student20@university.edu'),
('Student TwentyOne', 'Student', 'TwentyOne', 'student21', '$2a$10$hashedpassword', 'STUDENT', '21', 'student21@university.edu'),
('Student TwentyTwo', 'Student', 'TwentyTwo', 'student22', '$2a$10$hashedpassword', 'STUDENT', '22', 'student22@university.edu'),
('Student TwentyThree', 'Student', 'TwentyThree', 'student23', '$2a$10$hashedpassword', 'STUDENT', '23', 'student23@university.edu'),
('Student TwentyFour', 'Student', 'TwentyFour', 'student24', '$2a$10$hashedpassword', 'STUDENT', '24', 'student24@university.edu'),
('Student TwentyFive', 'Student', 'TwentyFive', 'student25', '$2a$10$hashedpassword', 'STUDENT', '25', 'student25@university.edu'),
('Student TwentySix', 'Student', 'TwentySix', 'student26', '$2a$10$hashedpassword', 'STUDENT', '26', 'student26@university.edu'),
('Student TwentySeven', 'Student', 'TwentySeven', 'student27', '$2a$10$hashedpassword', 'STUDENT', '27', 'student27@university.edu'),
('Student TwentyEight', 'Student', 'TwentyEight', 'student28', '$2a$10$hashedpassword', 'STUDENT', '28', 'student28@university.edu'),
('Student TwentyNine', 'Student', 'TwentyNine', 'student29', '$2a$10$hashedpassword', 'STUDENT', '29', 'student29@university.edu'),
('Student Thirty', 'Student', 'Thirty', 'student30', '$2a$10$hashedpassword', 'STUDENT', '30', 'student30@university.edu');
*/