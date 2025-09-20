-- Migration script to add batch field to users table for batch-wise course assignment
-- This script adds a batch column to support grouping students by academic batch

USE attendance_tracker;

-- Add batch column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch VARCHAR(20) AFTER role;

-- Update existing student records to have default batch values if needed
-- (Optional: You may want to set default values for existing students)
-- UPDATE users SET batch = '2024' WHERE role = 'STUDENT' AND batch IS NULL;

-- Add index for batch field to improve query performance
CREATE INDEX IF NOT EXISTS idx_users_batch ON users(batch);
CREATE INDEX IF NOT EXISTS idx_users_role_batch ON users(role, batch);

-- Migration completed: Users table now supports batch field for batch-wise assignment