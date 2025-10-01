-- Multi-Course Test Data Setup
-- Run this after setting up the main database schema

USE attendance_tracker;

-- Insert sample courses
INSERT INTO courses (courseCode, course_title, credit_hour) VALUES
('CS101', 'Introduction to Programming', 3),
('CS102', 'Data Structures and Algorithms', 3),
('CS201', 'Database Management Systems', 3),
('MATH201', 'Calculus I', 4),
('ENG101', 'English Composition', 2)
ON DUPLICATE KEY UPDATE courseCode=courseCode;

-- Create sample enrollments table if it doesn't exist based on database_setup.sql structure
-- This matches the student_course_enrollment table from the schema

-- Sample enrollment data (assuming you have users with IDs 1, 2, 3)
-- You'll need to adjust the studentID values based on your actual user IDs

-- Student 1 enrolled in CS101, CS102, MATH201
INSERT IGNORE INTO student_course_enrollment (studentID, courseCode) VALUES
(1, 'CS101'),
(1, 'CS102'),  
(1, 'MATH201');

-- Student 2 enrolled in CS101, ENG101
INSERT IGNORE INTO student_course_enrollment (studentID, courseCode) VALUES
(2, 'CS101'),
(2, 'ENG101');

-- Student 3 enrolled in CS102, CS201, MATH201
INSERT IGNORE INTO student_course_enrollment (studentID, courseCode) VALUES
(3, 'CS102'),
(3, 'CS201'),
(3, 'MATH201');

-- Verify the setup
SELECT 
    u.username,
    u.first_name,
    u.last_name,
    sce.courseCode,
    c.course_title
FROM users u
JOIN student_course_enrollment sce ON u.userID = sce.studentID
JOIN courses c ON sce.courseCode = c.courseCode
WHERE u.role = 'STUDENT'
ORDER BY u.username, sce.courseCode;

-- Check for any existing active sessions
SELECT 
    sessionID,
    courseCode,
    status,
    is_active,
    teacher_name,
    expiry_time,
    (expiry_time > NOW()) as not_expired
FROM class_sessions 
ORDER BY sessionID DESC 
LIMIT 10;