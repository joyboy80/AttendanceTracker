# WebAuthn Fingerprint Attendance - Frontend Usage Guide

## Overview
This guide explains how to use the WebAuthn-based fingerprint verification for attendance marking in the Smart Attendance Tracker system.

## Components

### 1. FingerprintRegistration Component
**Location:** `Frontend/src/components/Student/FingerprintRegistration.jsx`

**Usage:**
```jsx
import FingerprintRegistration from './FingerprintRegistration';

// In your component
<FingerprintRegistration />
```

**Features:**
- Checks if user already has a registered fingerprint
- Guides user through WebAuthn registration process
- Shows registration status and requirements
- One fingerprint per user limitation

### 2. FingerprintAttendance Component
**Location:** `Frontend/src/components/Student/FingerprintAttendance.jsx`

**Usage:**
```jsx
import FingerprintAttendance from './FingerprintAttendance';

// In your component
<FingerprintAttendance 
  onAttendanceMarked={() => {
    // Handle successful attendance marking
    console.log('Attendance marked successfully!');
  }}
/>
```

**Features:**
- Verifies user has registered fingerprint
- Performs WebAuthn authentication
- Automatically marks attendance on successful verification
- Provides user feedback throughout the process

## API Endpoints

All endpoints are prefixed with `/api/attendance/`

### Registration Flow
1. `POST /registration-options` - Get WebAuthn registration challenge
2. `POST /register` - Complete fingerprint registration

### Authentication Flow
1. `POST /authentication-options` - Get WebAuthn authentication challenge
2. `POST /verify` - Verify fingerprint and mark attendance

### Status Check
- `GET /fingerprint-status/{userId}` - Check if user has registered fingerprint

## JavaScript Utility Functions

### Base64URL Conversion
```javascript
// Convert Base64URL to ArrayBuffer
const base64URLToArrayBuffer = (base64URL) => {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
};

// Convert ArrayBuffer to Base64URL
const arrayBufferToBase64URL = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
```

## Browser Requirements

### WebAuthn Support
```javascript
// Check if WebAuthn is supported
if (!window.PublicKeyCredential) {
  alert('WebAuthn is not supported in this browser');
  return;
}
```

### Required Features
- Modern browser (Chrome 67+, Firefox 60+, Safari 14+, Edge 18+)
- Fingerprint sensor or biometric device
- HTTPS connection (localhost allowed for development)

## Error Handling

### Common Errors
1. **No WebAuthn Support:** Browser doesn't support WebAuthn API
2. **No Biometric Device:** Device doesn't have fingerprint sensor
3. **User Cancelled:** User cancelled the biometric prompt
4. **Registration Failed:** WebAuthn validation failed on server
5. **No Active Session:** No attendance session is currently active

### Error Display
```jsx
{error && (
  <div className="alert alert-danger">
    <i className="fas fa-exclamation-triangle me-2"></i>
    {error}
  </div>
)}
```

## Integration Examples

### Student Dashboard Integration
```jsx
// Add to StudentOverview.jsx
import FingerprintRegistration from './FingerprintRegistration';

// In the component render
<div className="row mb-4">
  <div className="col-md-12">
    <FingerprintRegistration />
  </div>
</div>
```

### Attendance Page Integration
```jsx
// Add to AttendancePage.jsx
import FingerprintAttendance from './FingerprintAttendance';

// Quick fingerprint option
<div className="card border-primary">
  <div className="card-header bg-primary text-white">
    <h5>Quick Fingerprint Attendance</h5>
  </div>
  <div className="card-body">
    <FingerprintAttendance 
      onAttendanceMarked={() => {
        alert('Attendance marked successfully!');
      }}
    />
  </div>
</div>
```

## Security Considerations

1. **No Biometric Data Storage:** Only public keys and metadata are stored
2. **Challenge-Response:** Each authentication uses a unique challenge
3. **Sign Counter:** Prevents replay attacks
4. **Origin Validation:** Requests are validated against allowed origins
5. **HTTPS Required:** Secure connection mandatory (except localhost)

## Styling Classes

### Bootstrap Classes Used
- `btn-primary`, `btn-success` - Button styling
- `alert-danger`, `alert-success` - Message styling  
- `spinner-border` - Loading indicators
- `card`, `card-header`, `card-body` - Layout structure
- `text-success`, `text-muted` - Text colors
- `fas fa-fingerprint` - FontAwesome fingerprint icon

### Custom Styling
```css
.fingerprint-scanner {
  transition: color 0.3s ease;
}

.fingerprint-success {
  color: #28a745;
}

.fingerprint-loading {
  animation: pulse 1.5s infinite;
}
```

## Testing

### Development Setup
1. Use localhost (HTTPS not required)
2. Ensure fingerprint sensor is available
3. Test with different browsers
4. Verify error handling scenarios

### Production Deployment
1. HTTPS certificate required
2. Proper CORS configuration
3. WebAuthn4J dependency included
4. Database migration applied