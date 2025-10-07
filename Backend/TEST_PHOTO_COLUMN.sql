-- STEP 2: Test the photo column functionality
USE attendance_tracker;

-- Check current users and their photo values
SELECT id, username, email, photo FROM users LIMIT 5;

-- Test updating a photo manually (use your actual user ID)
-- Replace '1' with your actual user ID
UPDATE users SET photo = '/test/photo/path.jpg' WHERE id = 1;

-- Check if update worked
SELECT id, username, email, photo FROM users WHERE id = 1;

-- Reset to NULL for testing
UPDATE users SET photo = NULL WHERE id = 1;