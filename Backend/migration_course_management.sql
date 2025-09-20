-- Course Management System Database Migration
-- Create courses and enrollments tables

-- Create courses table
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    credit INT NOT NULL,
    description TEXT,
    CONSTRAINT chk_credit_positive CHECK (credit > 0),
    INDEX idx_course_code (code)
);

-- Create enrollments table
CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    role ENUM('STUDENT', 'TEACHER') NOT NULL,
    CONSTRAINT fk_enrollment_user FOREIGN KEY (user_id) REFERENCES users(userID) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(userID),
    CONSTRAINT uk_user_course UNIQUE KEY (user_id, course_id),
    INDEX idx_enrollment_user_role (user_id, role),
    INDEX idx_enrollment_course (course_id)
);

-- Insert sample courses for testing
INSERT INTO courses (code, title, credit, description) VALUES
('CS101', 'Introduction to Computer Science', 3, 'Basic concepts of computer science including programming fundamentals'),
('CS201', 'Data Structures and Algorithms', 4, 'Advanced data structures and algorithm design and analysis'),
('MATH101', 'Calculus I', 4, 'Introduction to differential calculus with applications'),
('ENG101', 'English Composition', 3, 'Academic writing and communication skills'),
('PHYS101', 'General Physics I', 4, 'Mechanics, thermodynamics, and wave motion');

-- Create indexes for better performance
CREATE INDEX idx_courses_title ON courses(title);
CREATE INDEX idx_enrollments_role ON enrollments(role);

-- Add comments for documentation
ALTER TABLE courses COMMENT = 'Course catalog containing all available courses';
ALTER TABLE enrollments COMMENT = 'Student and teacher course assignments managed by administrators';