-- Migration: Create Routine table
-- Date: 2025-09-20
-- Description: Creates the Routine table with foreign key relationships to Course, Teacher, and Student (Batch)

CREATE TABLE IF NOT EXISTS Routine (
    RoutineID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID INT NOT NULL,
    CourseTime TIME NOT NULL,
    Day VARCHAR(20) NOT NULL,
    TeacherID INT NOT NULL,
    StudentBatch VARCHAR(50) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_routine_course FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    CONSTRAINT fk_routine_teacher FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID),
    
    -- Note: StudentBatch references Student.Batch (not a primary key, but a batch identifier)
    -- We'll add this constraint after verifying the Student table structure
    INDEX idx_routine_teacher (TeacherID),
    INDEX idx_routine_batch (StudentBatch),
    INDEX idx_routine_course (CourseID),
    INDEX idx_routine_day (Day)
);

-- Add some sample data for testing (optional)
-- INSERT INTO Routine (CourseID, CourseTime, Day, TeacherID, StudentBatch) 
-- VALUES 
-- (1, '09:00:00', 'Monday', 1, 'CSE-2021'),
-- (2, '14:00:00', 'Tuesday', 2, 'CSE-2022');