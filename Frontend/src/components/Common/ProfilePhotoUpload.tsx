import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePhotoUploadProps {
  currentPhoto?: string | null;
  onPhotoUpdated?: (photoUrl: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhoto,
  onPhotoUpdated
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle file selection and preview
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset messages
    setError(null);
    setSuccess(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload photo
  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0] || !user?.id) {
      setError('Please select a file first');
      return;
    }

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Profile photo uploaded successfully!');
        setPreview(data.fullUrl);
        if (onPhotoUpdated) {
          onPhotoUpdated(data.fullUrl);
        }
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const handleDelete = async () => {
    if (!user?.id) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/delete-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Profile photo deleted successfully!');
        setPreview(null);
        if (onPhotoUpdated) {
          onPhotoUpdated('');
        }
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error.message || 'Failed to delete photo');
    } finally {
      setUploading(false);
    }
  };

  // Reset preview to current photo
  const handleCancel = () => {
    setPreview(currentPhoto || null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-photo-upload">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-camera me-2"></i>
            Profile Photo
          </h5>
        </div>
        <div className="card-body text-center">
          {/* Photo Preview */}
          <div className="mb-3">
            {preview ? (
              <div className="position-relative d-inline-block">
                <img
                  src={preview}
                  alt="Profile"
                  className="rounded-circle img-thumbnail"
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    objectFit: 'cover',
                    border: '3px solid #007bff'
                  }}
                />
                {currentPhoto && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute"
                    style={{ top: '5px', right: '5px' }}
                    onClick={handleDelete}
                    disabled={uploading}
                    title="Delete Photo"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            ) : (
              <div 
                className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                style={{ width: '150px', height: '150px', border: '2px dashed #dee2e6' }}
              >
                <i className="fas fa-user fa-4x text-muted"></i>
              </div>
            )}
          </div>

          {/* File Input */}
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="form-control"
              disabled={uploading}
            />
            <small className="form-text text-muted">
              Only JPG, JPEG, and PNG files are allowed. Maximum size: 5MB
            </small>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading || !fileInputRef.current?.files?.[0]}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload me-2"></i>
                  Upload Photo
                </>
              )}
            </button>

            {fileInputRef.current?.files?.[0] && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={uploading}
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mt-3" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;