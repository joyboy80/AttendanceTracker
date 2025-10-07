@echo off
echo 🧪 GPS Location Integration Test - Windows
echo ===========================================

echo.
echo 📋 Step 1: Apply Database Schema
echo ================================
echo Please run the following MySQL commands:
echo.
echo mysql -u root -p attendance_db ^< setup_gps_location_complete.sql
echo.
pause

echo.
echo 📋 Step 2: Start Backend Server
echo ===============================
echo Please ensure the backend is running:
echo.
echo cd Backend
echo mvn spring-boot:run
echo.
pause

echo.
echo 📋 Step 3: Test Location Storage
echo ===============================
echo Testing backend location storage endpoint...
echo.

curl -X POST "http://localhost:8080/api/attendance/test-location-save" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 📋 Step 4: Manual Database Check
echo ===============================
echo Please run this MySQL query to check the table structure:
echo.
echo USE attendance_db;
echo DESCRIBE class_sessions;
echo.
echo Look for these columns:
echo - teacher_latitude (DECIMAL 10,8)
echo - teacher_longitude (DECIMAL 11,8) 
echo - location (VARCHAR 255)
echo.
pause

echo.
echo 📋 Step 5: Frontend Testing
echo ==========================
echo 1. Open teacher portal: http://localhost:5173
echo 2. Login as teacher
echo 3. Generate attendance code
echo 4. Click "Start Attendance" 
echo 5. Allow location permission when prompted
echo 6. Enter classroom name
echo 7. Check browser console for GPS logs
echo.
echo Expected console output:
echo 📍 Teacher GPS captured: {latitude: XX.XXXX, longitude: XX.XXXX}
echo 🌍 Teacher GPS coordinates formatted and added: {...}
echo 📡 Complete request URL: http://localhost:8080/api/attendance/start?sessionId=...
echo.
pause

echo.
echo 📋 Step 6: Student Testing  
echo =========================
echo 1. Open student portal: http://localhost:5173
echo 2. Login as student
echo 3. Enter the attendance code from teacher
echo 4. Click "Verify Location"
echo 5. Allow location permission when prompted
echo 6. Check console for verification logs
echo.
echo Expected console output:
echo 🌍 Student Location captured: XX.XXXX, XX.XXXX
echo 📡 Sending location verification request: {...}
echo ✅ Location verification result: {verified: true, distance: XX.X}
echo.
pause

echo.
echo 📋 Step 7: Database Verification
echo ===============================
echo Run this query to see stored teacher locations:
echo.
echo SELECT sessionID, courseCode, access_code, teacher_latitude, 
echo        teacher_longitude, location, is_active 
echo FROM class_sessions 
echo WHERE teacher_latitude IS NOT NULL 
echo ORDER BY sessionID DESC LIMIT 5;
echo.
pause

echo.
echo ✅ GPS Location Integration Test Guide Completed!
echo ==============================================
echo.
echo 🔍 Troubleshooting:
echo.
echo ❌ If teacher_latitude/longitude are still NULL:
echo   1. Check database schema was applied correctly
echo   2. Verify backend receives GPS parameters in logs
echo   3. Check frontend sends coordinates in network tab
echo   4. Restart backend server after schema changes
echo.
echo ❌ If location verification fails:
echo   1. Ensure teacher location was saved first
echo   2. Check student uses correct attendance code  
echo   3. Verify GPS permissions are granted
echo   4. Check backend logs for verification process
echo.
echo ❌ If GPS permission denied:
echo   1. Clear browser site data
echo   2. Use HTTPS instead of HTTP (if possible)
echo   3. Check browser location settings
echo   4. Try different browser
echo.
pause