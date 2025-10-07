#!/bin/bash

# GPS Location Integration Test Script
# This script tests the complete flow of teacher location capture and student verification

echo "🧪 GPS Location Integration Test Starting..."
echo "=============================================="

# Test 1: Check if database schema is ready
echo "📋 Test 1: Database Schema Check"
echo "================================"

mysql -u root -p attendance_db -e "
USE attendance_db;
DESCRIBE class_sessions;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'attendance_db' 
AND TABLE_NAME = 'class_sessions' 
AND COLUMN_NAME IN ('teacher_latitude', 'teacher_longitude', 'location');
"

echo ""
echo "📋 Test 2: Backend Location Storage Test"
echo "========================================"

# Test the backend location storage endpoint
curl -X POST "http://localhost:8080/api/attendance/test-location-save" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "📋 Test 3: Manual Location Update Test"
echo "======================================"

# Test manual location update (you'll need to replace SESSION_ID)
# curl -X POST "http://localhost:8080/api/attendance/update-session-location?sessionId=1&latitude=40.7589&longitude=-73.9851&location=Test%20Room" \
#   -H "Authorization: Bearer YOUR_TOKEN" | jq '.'

echo ""
echo "📋 Test 4: Database Direct Insert Test" 
echo "====================================="

mysql -u root -p attendance_db -e "
USE attendance_db;

-- Clean up any existing test data
DELETE FROM class_sessions WHERE courseCode = 'GPS_TEST';

-- Insert test session with location
INSERT INTO class_sessions (
    courseCode, 
    scheduled_time, 
    duration, 
    access_code, 
    expiry_time, 
    status, 
    is_active,
    teacher_name,
    teacher_username,
    teacher_latitude,
    teacher_longitude,
    location
) VALUES (
    'GPS_TEST', 
    NOW(), 
    120, 
    'GPS123TEST', 
    DATE_ADD(NOW(), INTERVAL 120 SECOND), 
    'ACTIVE', 
    TRUE,
    'GPS Test Teacher',
    'gps_test',
    40.7589,
    -73.9851,
    'GPS Test Room'
);

-- Verify the data was inserted
SELECT 
    sessionID,
    courseCode,
    access_code,
    teacher_latitude,
    teacher_longitude,
    location,
    is_active,
    scheduled_time
FROM class_sessions 
WHERE courseCode = 'GPS_TEST';
"

echo ""
echo "📋 Test 5: Location Verification API Test"
echo "========================================="

# Test location verification with the test session
curl -X POST "http://localhost:8080/api/attendance/verify-location" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "latitude": 40.7590,
    "longitude": -73.9850,
    "attendanceCode": "GPS123TEST"
  }' | jq '.'

echo ""
echo "📋 Test 6: Session Location Debug"
echo "================================"

# Debug the session location
curl "http://localhost:8080/api/attendance/debug-session-location?accessCode=GPS123TEST" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'

echo ""
echo "📋 Test 7: Cleanup Test Data"
echo "==========================="

mysql -u root -p attendance_db -e "
USE attendance_db;
DELETE FROM class_sessions WHERE courseCode = 'GPS_TEST';
SELECT 'Test data cleaned up successfully' AS result;
"

echo ""
echo "✅ GPS Location Integration Test Completed!"
echo "==========================================="
echo ""
echo "📝 Expected Results:"
echo "- Test 1: Should show teacher_latitude, teacher_longitude, location columns exist"
echo "- Test 2: Should return SUCCESS with location coordinates"
echo "- Test 4: Should show GPS_TEST session with latitude=40.7589, longitude=-73.9851"
echo "- Test 5: Should return verified=true with distance calculation"
echo "- Test 6: Should show session found with teacher location data"
echo ""
echo "🚨 If any test fails, check:"
echo "1. Database schema migration was applied"
echo "2. Backend server is running on port 8080"
echo "3. Authentication token is valid"
echo "4. MySQL credentials are correct"