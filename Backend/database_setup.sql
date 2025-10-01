-- Create database
CREATE DATABASE IF NOT EXISTS attendance_tracker;
USE attendance_tracker;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    userID BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
    batch VARCHAR(20),
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
    attendance_code VARCHAR(255) NOT NULL,
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

-- Add missing columns to existing class_sessions table
ALTER TABLE class_sessions 
ADD COLUMN IF NOT EXISTS status ENUM('ACTIVE', 'ENDED', 'PAUSED') DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS remaining_time INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS teacher_username VARCHAR(50);

-- Update existing attendance table to match expected schema
ALTER TABLE attendance 
MODIFY COLUMN status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL DEFAULT 'PRESENT',
ADD COLUMN IF NOT EXISTS attendance_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS biometric_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

-- Add performance indexes for attendance queries
CREATE INDEX IF NOT EXISTS idx_attendance_student_session ON attendance(studentID, sessionID);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(sessionID);
CREATE INDEX IF NOT EXISTS idx_attendance_code ON attendance(attendance_code);
CREATE INDEX IF NOT EXISTS idx_class_sessions_course_active ON class_sessions(courseCode, is_active, status);
CREATE INDEX IF NOT EXISTS idx_class_sessions_access_code ON class_sessions(access_code);

-- Database schema created. No sample data included.
-- Users must be created through the signup process.
