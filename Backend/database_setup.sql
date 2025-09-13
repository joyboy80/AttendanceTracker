-- Create database
CREATE DATABASE IF NOT EXISTS attendance_tracker;
USE attendance_tracker;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    userID BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    middleName VARCHAR(50),
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
    teacherID BIGINT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    photo VARCHAR(255),
    FOREIGN KEY (teacherID) REFERENCES users(userID) ON DELETE CASCADE
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    studentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    batch VARCHAR(20) NOT NULL,
    section VARCHAR(10),
    photo VARCHAR(255),
    FOREIGN KEY (studentID) REFERENCES users(userID) ON DELETE CASCADE
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    courseCode VARCHAR(20) PRIMARY KEY,
    course_title VARCHAR(200) NOT NULL,
    credit_hour INT NOT NULL,
    class_schedule TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create class_sessions table
CREATE TABLE IF NOT EXISTS class_sessions (
    sessionID BIGINT AUTO_INCREMENT PRIMARY KEY,
    courseCode VARCHAR(20) NOT NULL,
    scheduled_time DATETIME NOT NULL,
    duration INT NOT NULL DEFAULT 60,
    access_code VARCHAR(20),
    attendance_link VARCHAR(500),
    expiry_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseCode) REFERENCES courses(courseCode) ON DELETE CASCADE
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    attendanceID BIGINT AUTO_INCREMENT PRIMARY KEY,
    studentID BIGINT NOT NULL,
    courseCode VARCHAR(20) NOT NULL,
    sessionID BIGINT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    biometric_verified BOOLEAN DEFAULT FALSE,
    location_verified BOOLEAN DEFAULT FALSE,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL DEFAULT 'PRESENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentID) REFERENCES students(studentID) ON DELETE CASCADE,
    FOREIGN KEY (courseCode) REFERENCES courses(courseCode) ON DELETE CASCADE,
    FOREIGN KEY (sessionID) REFERENCES class_sessions(sessionID) ON DELETE CASCADE
);

-- Create biometric_log table
CREATE TABLE IF NOT EXISTS biometric_log (
    biometricID BIGINT AUTO_INCREMENT PRIMARY KEY,
    studentID BIGINT NOT NULL,
    biometric_type ENUM('FINGERPRINT', 'FACE', 'IRIS') NOT NULL,
    public_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentID) REFERENCES students(studentID) ON DELETE CASCADE
);

-- Create attendance_stats table
CREATE TABLE IF NOT EXISTS attendance_stats (
    statsID BIGINT AUTO_INCREMENT PRIMARY KEY,
    studentID BIGINT NOT NULL,
    courseCode VARCHAR(20) NOT NULL,
    total_classes INT NOT NULL DEFAULT 0,
    attended INT NOT NULL DEFAULT 0,
    absent INT NOT NULL DEFAULT 0,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    mark VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentID) REFERENCES students(studentID) ON DELETE CASCADE,
    FOREIGN KEY (courseCode) REFERENCES courses(courseCode) ON DELETE CASCADE,
    UNIQUE KEY unique_student_course (studentID, courseCode)
);

-- Create teacher_course_assignment table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS teacher_course_assignment (
    assignmentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacherID BIGINT NOT NULL,
    courseCode VARCHAR(20) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherID) REFERENCES teachers(teacherID) ON DELETE CASCADE,
    FOREIGN KEY (courseCode) REFERENCES courses(courseCode) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_course (teacherID, courseCode)
);

-- Create student_course_enrollment table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS student_course_enrollment (
    enrollmentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    studentID BIGINT NOT NULL,
    courseCode VARCHAR(20) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentID) REFERENCES students(studentID) ON DELETE CASCADE,
    FOREIGN KEY (courseCode) REFERENCES courses(courseCode) ON DELETE CASCADE,
    UNIQUE KEY unique_student_course (studentID, courseCode)
);

-- Insert sample data
INSERT INTO users (firstName, middleName, lastName, name, email, phone, username, password, role) VALUES
('John', 'Michael', 'Doe', 'John Michael Doe', 'john.doe@university.edu', '1234567890', 'student1', '$2a$10$qJC9DBZg9rVjTwkQzX4gmunHsZQDZGlzPHWi0EAKvVnE75xGKWqT.', 'STUDENT'),
('Jane', 'Elizabeth', 'Smith', 'Jane Elizabeth Smith', 'jane.smith@university.edu', '1234567891', 'teacher1', '$2a$10$qJC9DBZg9rVjTwkQzX4gmunHsZQDZGlzPHWi0EAKvVnE75xGKWqT.', 'TEACHER'),
('Admin', NULL, 'User', 'Admin User', 'admin@university.edu', '1234567892', 'admin1', '$2a$10$qJC9DBZg9rVjTwkQzX4gmunHsZQDZGlzPHWi0EAKvVnE75xGKWqT.', 'ADMIN');

-- Insert sample student data
INSERT INTO students (studentID, department, batch, section) VALUES
(1, 'Computer Science', '2024', 'A');

-- Insert sample teacher data
INSERT INTO teachers (teacherID, department, designation) VALUES
(2, 'Computer Science', 'Professor');

-- Insert sample courses
INSERT INTO courses (courseCode, course_title, credit_hour, class_schedule) VALUES
('CS101', 'Introduction to Computer Science', 3, 'Monday, Wednesday, Friday 9:00-10:00 AM'),
('CS201', 'Data Structures and Algorithms', 3, 'Tuesday, Thursday 10:00-11:30 AM'),
('CS301', 'Database Systems', 3, 'Monday, Wednesday 2:00-3:30 PM'),
('CS401', 'Software Engineering', 3, 'Tuesday, Thursday 1:00-2:30 PM');

-- Insert sample class sessions
INSERT INTO class_sessions (courseCode, scheduled_time, duration, access_code) VALUES
('CS101', '2024-01-15 09:00:00', 60, 'CS101_001'),
('CS101', '2024-01-17 09:00:00', 60, 'CS101_002'),
('CS201', '2024-01-16 10:00:00', 90, 'CS201_001');

-- Insert sample attendance
INSERT INTO attendance (studentID, courseCode, sessionID, status, biometric_verified, location_verified) VALUES
(1, 'CS101', 1, 'PRESENT', TRUE, TRUE),
(1, 'CS101', 2, 'PRESENT', TRUE, TRUE),
(1, 'CS201', 3, 'LATE', TRUE, FALSE);

-- Insert sample attendance stats
INSERT INTO attendance_stats (studentID, courseCode, total_classes, attended, absent, percentage) VALUES
(1, 'CS101', 2, 2, 0, 100.00),
(1, 'CS201', 1, 1, 0, 100.00);

-- Insert sample teacher course assignments
INSERT INTO teacher_course_assignment (teacherID, courseCode) VALUES
(2, 'CS101'),
(2, 'CS201');

-- Insert sample student course enrollments
INSERT INTO student_course_enrollment (studentID, courseCode) VALUES
(1, 'CS101'),
(1, 'CS201');
