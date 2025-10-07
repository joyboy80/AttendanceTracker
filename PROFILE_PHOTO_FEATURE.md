# Profile Photo Upload Feature

## Overview
This feature allows users to upload, view, and manage their profile photos in the attendance tracking system.

## Features
- **Photo Upload**: Users can upload JPG, JPEG, and PNG images (max 5MB)
- **Photo Preview**: Real-time preview before uploading
- **Photo Display**: Profile photos are displayed in user profile and navigation
- **Photo Delete**: Users can remove their profile photos
- **Validation**: File type, size, and format validation
- **Responsive Design**: Works on all device sizes

## Technical Implementation

### Backend (Spring Boot)
- **Entity**: Added `photo` field to User entity
- **Service**: `FileStorageService` handles file operations
- **Controller**: `UserController` provides REST endpoints
- **Configuration**: `WebMvcConfig` serves static files
- **Storage**: Files stored locally in `/uploads/` directory

### Frontend (React)
- **ProfilePhotoUpload**: Main upload component with drag-drop interface
- **ProfileAvatar**: Reusable avatar component for navigation
- **UserProfile**: Updated to include photo upload functionality

### Database
- Added `photo` column (VARCHAR 500) to `users` table

## API Endpoints

### Upload Profile Photo
```
POST /api/users/{userId}/upload-photo
Content-Type: multipart/form-data
Authorization: Bearer {token}

Parameters:
- file: MultipartFile (image file)

Response:
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "photoUrl": "/uploads/user_123_uuid.jpg",
  "fullUrl": "http://localhost:8080/uploads/user_123_uuid.jpg"
}
```

### Delete Profile Photo
```
DELETE /api/users/{userId}/delete-photo
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Profile photo deleted successfully"
}
```

### Get User Profile (includes photo)
```
GET /api/users/profile/{userId}
Authorization: Bearer {token}

Response:
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "photo": "/uploads/user_123_uuid.jpg",
  "photoUrl": "http://localhost:8080/uploads/user_123_uuid.jpg",
  ...
}
```

## File Validation

### Allowed File Types
- JPG (.jpg)
- JPEG (.jpeg) 
- PNG (.png)

### File Size Limits
- Maximum file size: 5MB
- Maximum request size: 10MB

### Security Measures
- File type validation (MIME type checking)
- File extension validation
- Unique filename generation (user ID + UUID)
- Secure file storage outside web root

## File Storage Structure
```
project-root/
├── uploads/
│   ├── user_1_a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6.jpg
│   ├── user_2_b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7.png
│   └── ...
└── ...
```

## Usage Instructions

### For Users
1. **Upload Photo**:
   - Open user profile
   - Click "Choose File" or drag & drop image
   - Click "Upload Photo" button
   - Wait for success confirmation

2. **View Photo**:
   - Profile photo appears in user profile header
   - Avatar shows in navigation (if implemented)

3. **Delete Photo**:
   - Click delete button (trash icon) on photo
   - Confirm deletion

### For Developers
1. **Component Usage**:
```jsx
// Full upload component
<ProfilePhotoUpload 
  currentPhoto={photoUrl}
  onPhotoUpdated={(url) => setPhotoUrl(url)}
/>

// Simple avatar display
<ProfileAvatar size="md" showName={true} />
```

2. **Service Integration**:
```javascript
// Upload photo
const formData = new FormData();
formData.append('file', file);

fetch(`/api/users/${userId}/upload-photo`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## Error Handling

### Common Errors
- **File too large**: "File size must be less than 5MB"
- **Invalid file type**: "Only JPG, JPEG, and PNG files are allowed"
- **Upload failed**: "Failed to upload photo"
- **User not found**: "User not found"
- **Network error**: "Error uploading photo. Please try again."

### Frontend Validation
- Real-time file type checking
- File size validation before upload
- Progress indicators during upload
- Success/error message display

### Backend Validation
- MIME type verification
- File extension checking
- Size limit enforcement
- User authentication verification

## Configuration

### Backend Configuration (application.yml)
```yaml
file:
  upload:
    dir: uploads
    max-file-size: 5MB
    max-request-size: 10MB

spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB
      enabled: true
```

### Database Migration
```sql
-- Add photo column to users table
ALTER TABLE users 
ADD COLUMN photo VARCHAR(500) DEFAULT NULL 
COMMENT 'Profile photo path or URL for the user';
```

## Security Considerations
- Files stored outside web accessible directory
- Unique filename generation prevents conflicts
- File type validation prevents malicious uploads
- Authentication required for all operations
- User can only modify their own photo

## Future Enhancements
- Image resizing/compression
- Multiple photo sizes (thumbnails)
- Cloud storage integration (AWS S3, etc.)
- Batch photo operations
- Photo approval workflow for admins
- Photo history/versioning