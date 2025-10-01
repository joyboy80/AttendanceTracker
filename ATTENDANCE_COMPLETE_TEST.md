# 🧪 Complete Attendance Synchronization Test

## Quick Test Commands

### 1. Database Verification
```sql
-- Connect to database
mysql -u root -pStrongPass123! attendance_tracker

-- Check table structure
DESCRIBE class_sessions;

-- Check if there are any sessions
SELECT sessionID, courseCode, status, is_active, expiry_time, teacher_name 
FROM class_sessions 
WHERE courseCode = 'CS101' 
ORDER BY sessionID DESC LIMIT 5;

-- Clean up old sessions (optional)
DELETE FROM class_sessions WHERE courseCode = 'CS101';
```

### 2. Backend API Test
```bash
# Replace YOUR_TOKEN with actual JWT token from localStorage

# Test debug endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8080/api/attendance/debug-sessions?courseCode=CS101"

# Test active session endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8080/api/attendance/active?courseCode=CS101"

# Create a test session
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8080/api/attendance/generate?courseCode=CS101&teacherName=Test%20Teacher&teacherUsername=testuser"
```

### 3. Frontend Console Test
Open Student Portal and run in browser console:

```javascript
// Test session detection manually
const testSessionDetection = async () => {
    const token = localStorage.getItem('attendanceToken');
    
    console.log('Testing session detection...');
    
    // Check debug info
    const debugRes = await fetch('http://localhost:8080/api/attendance/debug-sessions?courseCode=CS101', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (debugRes.ok) {
        const debugData = await debugRes.json();
        console.log('Debug Data:', debugData);
    }
    
    // Check active session
    const activeRes = await fetch('http://localhost:8080/api/attendance/active?courseCode=CS101', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (activeRes.ok) {
        const activeData = await activeRes.json();
        console.log('Active Session:', activeData);
    }
};

testSessionDetection();
```

## Step-by-Step Testing

### Step 1: Start Backend Server
```bash
cd Backend
mvn spring-boot:run
```
Expected: Server starts on port 8080

### Step 2: Start Frontend Server
```bash
cd Frontend
npm run dev
```
Expected: Frontend starts on port 5173 (or similar)

### Step 3: Login as Teacher
1. Navigate to http://localhost:5173
2. Login with teacher credentials
3. Go to "Activate Attendance" page

### Step 4: Create Session (Teacher)
1. Click "Generate Code"
2. Set duration to 120 seconds
3. Click "Start Attendance"
4. **Verify**: You should see countdown timer and session becomes active

### Step 5: Check Student Portal (Same Time)
1. In different browser/tab, login as student
2. Go to "Mark Attendance" page
3. **Expected Results**:
   - Page should automatically detect session within 1-2 seconds
   - You should see notification: "🎉 New Attendance Session Detected!"
   - Teacher information should display
   - Countdown timer should show
   - Attendance form should become available

### Step 6: Console Verification
In Student Portal, open Developer Tools Console. You should see:
```
🔍 Checking for active session...
🐛 Debug Database Info: {totalSessions: 1, activeSessionFound: true, ...}
📡 API Response Status: 200
📋 Session Response Data: {sessionID: 123, isActive: true, ...}
✅ Active session found: 123
🎉 NEW SESSION DETECTED! Showing notification...
👨‍🏫 Teacher: Test Teacher
⏱️ Time remaining: 118 seconds
```

## Troubleshooting

### Issue 1: "No sessions found in database"
**Solution**:
```sql
-- Check if table exists and has correct columns
SHOW CREATE TABLE class_sessions;

-- If missing columns, run:
ALTER TABLE class_sessions 
ADD COLUMN IF NOT EXISTS status ENUM('ACTIVE', 'ENDED', 'PAUSED') DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS teacher_username VARCHAR(50);
```

### Issue 2: "Sessions exist but none are active"
**Check**:
- `status` should be 'ACTIVE'
- `is_active` should be `true` (1)
- `expiry_time` should be in the future
- Run this query:
```sql
SELECT sessionID, status, is_active, expiry_time, NOW() as current_time,
       (expiry_time > NOW()) as not_expired
FROM class_sessions 
WHERE courseCode = 'CS101';
```

### Issue 3: "401 Authentication Error"
**Solution**:
- Check if JWT token exists in localStorage
- Token might be expired - re-login
- Verify backend JWT validation is working

### Issue 4: "Backend Connection Failed"
**Check**:
- Backend server is running on port 8080
- CORS is properly configured
- Firewall/antivirus not blocking connections

### Issue 5: "Session Created but Not Detected"
**Debug**:
1. Check database immediately after creation:
```sql
SELECT * FROM class_sessions WHERE courseCode = 'CS101' ORDER BY sessionID DESC LIMIT 1;
```

2. Verify the session meets active criteria:
```sql
SELECT sessionID, 
       (status = 'ACTIVE') as status_ok,
       (is_active = 1) as active_ok,
       (expiry_time > NOW()) as time_ok,
       expiry_time, NOW()
FROM class_sessions 
WHERE courseCode = 'CS101' 
ORDER BY sessionID DESC LIMIT 1;
```

## Success Indicators

### ✅ Working System Should Show:
1. **Teacher Portal**: Session creates and starts successfully
2. **Database**: New row in class_sessions with correct status
3. **Student Portal**: 
   - Automatic detection within 1-2 seconds
   - Notification banner appears
   - Teacher name displays
   - Countdown timer works
   - Console shows success messages

### ❌ Common Failure Points:
1. Database schema missing required columns
2. Backend not setting `is_active = true` when starting session
3. Frontend polling not working (no console messages)
4. JWT authentication issues
5. CORS blocking requests

## Expected Timeline
- **T+0s**: Teacher clicks "Start Attendance"
- **T+1s**: Database updated with active session
- **T+1-2s**: Student Portal detects session (next poll cycle)
- **T+2s**: Student sees notification and can mark attendance

The key is that students should see the session **automatically without any manual refresh** within 1-2 seconds of teacher activation.