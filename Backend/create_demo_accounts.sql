-- Create demo accounts with correct password hash for "password"
-- This script can be run to create the demo accounts

USE attendance_tracker;

-- Delete existing demo accounts if they exist
DELETE FROM students WHERE studentID IN (1, 2, 3);
DELETE FROM teachers WHERE teacherID IN (1, 2, 3);
DELETE FROM users WHERE userID IN (1, 2, 3);

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE teachers AUTO_INCREMENT = 1;

-- Insert demo users with correct password hash for "password"
INSERT INTO users (firstName, middleName, lastName, name, email, phone, username, password, role) VALUES
('John', 'Michael', 'Doe', 'John Michael Doe', 'john.doe@university.edu', '1234567890', 'student1', '$2a$10$qJC9DBZg9rVjTwkQzX4gmunHsZQDZGlzPHWi0EAKvVnE75xGKWqT.', 'STUDENT'),
('Jane', 'Elizabeth', 'Smith', 'Jane Elizabeth Smith', 'jane.smith@university.edu', '1234567891', 'teacher1', '$2a$10$qJC9DBZg9rVjTwkQzX4gmunHsZQDZGlzPHWi0EAKvVnE75xGKWqT.', 'TEACHER'),
('Admin', NULL, 'User', 'Admin User', 'admin@university.edu', '1234567892', 'admin1', '$2a$10$qJC9DBZg9rVjTwkQzX4gmunHsZQDZGlzPHWi0EAKvVnE75xGKWqT.', 'ADMIN');

-- Insert corresponding student and teacher records
INSERT INTO students (studentID, department, batch, section) VALUES
(1, 'Computer Science', '2024', 'A');

INSERT INTO teachers (teacherID, department, designation) VALUES
(2, 'Computer Science', 'Professor');

-- Verify the accounts were created
SELECT u.userID, u.username, u.role, u.name, s.department, s.batch, t.designation 
FROM users u 
LEFT JOIN students s ON u.userID = s.studentID 
LEFT JOIN teachers t ON u.userID = t.teacherID 
WHERE u.username IN ('student1', 'teacher1', 'admin1');

