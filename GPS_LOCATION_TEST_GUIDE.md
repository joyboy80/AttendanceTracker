# 🧪 GPS Location Verification Test Guide

## Quick Testing Steps

### 1. **Test Database Schema**
First, check if the location columns exist:
```sql
-- Connect to MySQL and run:
USE attendance_db;
DESCRIBE class_sessions;

-- If the columns don't exist, run the migration:
SOURCE migration_add_location_fields.sql;
```

### 2. **Backend Test Endpoints**

#### Test Location Save Functionality
```bash
# Test if teacher location is being saved properly
curl -X POST "http://localhost:8080/api/attendance/test-location-save" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "step1_generate": "Session generated: 123",
  "step2_start": "Session started with location", 
  "savedLatitude": 40.7589,
  "savedLongitude": -73.9851,
  "savedLocation": "Test Classroom",
  "step3_verify": "Location retrieved successfully",
  "status": "SUCCESS"
}
```

#### Debug Session Location
```bash
# Check if a session has location data
curl "http://localhost:8080/api/attendance/debug-session-location?accessCode=YOUR_CODE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. **Frontend Testing Steps**

#### Teacher Side:
1. **Open Teacher Portal**: `http://localhost:5173`
2. **Login** as teacher
3. **Generate Code**: Click "Generate Code" 
4. **Start Attendance**: Click "Start Attendance"
   - Browser will ask for location permission
   - Allow location access
   - Enter classroom name when prompted
   - Check browser console for location logs

#### Student Side:
1. **Open Student Portal**: `http://localhost:5173`  
2. **Login** as student
3. **Enter Attendance Code**: From teacher
4. **Verify Location**: Click "Verify Location"
   - Browser will ask for location permission
   - Allow location access
   - Check browser console for verification logs

### 4. **Console Debugging**

#### Teacher Side Console Logs:
```
🌍 Teacher location added to request: {latitude: 40.7589, longitude: -73.9851, location: "Classroom"}
📡 Starting attendance with URL: http://localhost:8080/api/attendance/start?sessionId=123&duration=120&teacherLatitude=40.7589&teacherLongitude=-73.9851&location=Classroom
✅ Session started successfully: {...}
```

#### Student Side Console Logs:
```
🌍 Student Location captured: 40.7590, -73.9850
🎫 Using attendance code: abc123
📡 Sending location verification request: {...}
📨 Response status: 200
✅ Location verification result: {verified: true, distance: 15.2, message: "Location verified! You are 15.2 meters from the classroom."}
👨‍🏫 Teacher location: {latitude: 40.7589, longitude: -73.9851, locationName: "Classroom"}
```

#### Backend Console Logs:
```
DEBUG: Starting attendance with location - sessionId: 123, lat: 40.7589, lon: -73.9851, location: Classroom
DEBUG: Teacher location set - lat: 40.7589, lon: -73.9851
DEBUG: Session saved with teacher location - lat: 40.7589, lon: -73.9851, location: Classroom
INFO: Starting location verification for student 1 with code abc123
INFO: Found session 123 for verification
INFO: Teacher location: lat=40.7589, lon=-73.9851, location=Classroom
INFO: Location verification for student 1: distance=15.2m, verified=true
```

### 5. **Common Issues & Solutions**

#### Issue 1: "No teacher location set for session"
**Cause**: Database columns don't exist or teacher location wasn't captured
**Solution**:
1. Run database migration: `SOURCE migration_add_location_fields.sql`
2. Restart backend server
3. Test location save: `POST /api/attendance/test-location-save`

#### Issue 2: Location permission denied
**Cause**: Browser blocked location access
**Solution**:
1. Click the location icon in address bar
2. Select "Always allow" for location
3. Refresh page and try again

#### Issue 3: "Session not found" error
**Cause**: Attendance code mismatch or session not active
**Solution**:
1. Check session status: `GET /api/attendance/debug-session-location?accessCode=CODE`
2. Verify session is active and code matches
3. Generate new session if needed

#### Issue 4: Distance calculation returns 0
**Cause**: Teacher and student have same coordinates (testing on same device)
**Solution**:
1. Use different coordinates for testing
2. Modify test coordinates in browser developer tools
3. Test with actual different physical locations

### 6. **Manual Location Testing**

If GPS is not available, you can simulate coordinates:
```javascript
// In browser console, override geolocation
navigator.geolocation.getCurrentPosition = function(success, error, options) {
  success({
    coords: {
      latitude: 40.7590,   // Slightly different from teacher
      longitude: -73.9850  // to test distance calculation
    }
  });
};
```

### 7. **Database Verification**

Check if location data is being stored:
```sql
-- View recent sessions with location data
SELECT sessionID, courseCode, access_code, teacher_latitude, teacher_longitude, location, is_active
FROM class_sessions 
WHERE teacher_latitude IS NOT NULL 
ORDER BY sessionID DESC 
LIMIT 5;
```

### 8. **Success Criteria**

✅ **Database**: Location columns exist and accept data  
✅ **Teacher**: Location captured during session start  
✅ **Student**: Location verification with distance calculation  
✅ **Distance**: Haversine formula returns accurate results  
✅ **Radius**: 100m verification works correctly  
✅ **Integration**: Works with existing WebAuthn system  

### 9. **Troubleshooting Commands**

```bash
# Check backend logs
tail -f Backend/logs/application.log

# Test backend compilation
cd Backend && mvn clean compile

# Test frontend
cd Frontend && npm run dev

# Database connection test
mysql -u root -p -e "USE attendance_db; SELECT COUNT(*) FROM class_sessions;"
```

## Expected Complete Flow:

1. **Teacher**: Generate code → Start with GPS → Location saved
2. **Student**: Enter code → GPS verification → Within 100m → Fingerprint → Attendance marked
3. **System**: Haversine calculation → Distance validation → Success/failure message

This comprehensive testing guide will help identify exactly where the teacher location capture or student verification is failing.