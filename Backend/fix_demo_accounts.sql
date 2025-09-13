-- Fix demo accounts with correct password hash for "password"
-- This hash corresponds to the password "password"

USE attendance_tracker;

-- Update existing demo accounts with correct password hash
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE username = 'student1';
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE username = 'teacher1';
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE username = 'admin1';

-- Or insert demo accounts if they don't exist
INSERT IGNORE INTO users (firstName, middleName, lastName, name, email, phone, username, password, role) VALUES
('John', 'Michael', 'Doe', 'John Michael Doe', 'john.doe@university.edu', '1234567890', 'student1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'STUDENT'),
('Jane', 'Elizabeth', 'Smith', 'Jane Elizabeth Smith', 'jane.smith@university.edu', '1234567891', 'teacher1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'TEACHER'),
('Admin', NULL, 'User', 'Admin User', 'admin@university.edu', '1234567892', 'admin1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'ADMIN');

-- Insert corresponding student and teacher records
INSERT IGNORE INTO students (studentID, department, batch, section) VALUES
(1, 'Computer Science', '2024', 'A');

INSERT IGNORE INTO teachers (teacherID, department, designation) VALUES
(2, 'Computer Science', 'Professor');

