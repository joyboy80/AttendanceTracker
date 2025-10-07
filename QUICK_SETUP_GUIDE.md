# Quick Setup and Testing Guide

## 🚀 Setup Instructions

### 1. Database Migration
Run the following SQL to create the attendance_credentials table:

```sql
-- Copy and run this in your MySQL database
CREATE TABLE IF NOT EXISTS attendance_credentials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    credential_id VARCHAR(512) NOT NULL UNIQUE,
    public_key LONGBLOB NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userID) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, active),
    INDEX idx_credential_id (credential_id)
);
```

### 2. Start Backend
```bash
cd Backend
mvn spring-boot:run
```

### 3. Start Frontend
```bash
cd Frontend
npm run dev
```

## 🧪 Testing the Fingerprint Feature

### Step 1: Register Fingerprint
1. Login as a student
2. Go to the dashboard (Student Overview)
3. Find the "Fingerprint Registration" card
4. Click "Register Fingerprint"
5. Follow the browser prompts (may show mock WebAuthn for now)

### Step 2: Mark Attendance with Fingerprint
1. Go to "Give Attendance" page
2. Look for "Quick Fingerprint Attendance" section
3. Click "Use Fingerprint" button
4. Verify attendance is marked successfully

## 🔧 Current Implementation Status

### ✅ Working Features
- API endpoints created and functional
- Database schema ready
- Frontend components integrated
- Basic validation and error handling
- Mock WebAuthn flow (for development)

### 🛠️ Development Notes
- Currently using simplified WebAuthn validation
- Mock credential storage for development
- Full WebAuthn4J integration can be added later
- Frontend WebAuthn API calls are ready for real implementation

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors Fixed** ✅
   - Changed from `AuthContext` to `useAuth()` hook
   - Updated user ID property from `userID` to `id`

2. **API URLs Updated** ✅
   - Using full localhost URLs for consistency
   - Backend endpoints properly configured with CORS

3. **WebAuthn Dependencies** 
   - Simplified implementation without external library
   - Ready for WebAuthn4J integration when needed

### Browser Testing
- Use Chrome/Edge/Firefox with developer tools open
- Check console for any JavaScript errors
- Verify network requests are reaching the backend

### Database Verification
```sql
-- Check if credentials table was created
DESCRIBE attendance_credentials;

-- Check for registered credentials (after testing)
SELECT * FROM attendance_credentials;
```

## 📱 Expected User Flow

### Registration Flow
1. Student sees registration card in dashboard
2. Clicks "Register Fingerprint"
3. Browser shows WebAuthn prompt
4. Success message appears
5. Card shows "Fingerprint Registered" status

### Attendance Flow
1. Active class session must exist
2. Student goes to attendance page
3. Sees fingerprint option at top
4. Clicks "Use Fingerprint"
5. Browser prompts for biometric
6. Attendance marked automatically
7. Success confirmation shown

## 🔄 Next Steps for Full WebAuthn

To implement real WebAuthn validation:

1. Add proper WebAuthn4J dependency
2. Update `WebAuthnService` with real validation
3. Handle browser compatibility edge cases
4. Add proper cryptographic verification
5. Test with real biometric devices

For now, the mock implementation allows testing the complete user flow and API structure.