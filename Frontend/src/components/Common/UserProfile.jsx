import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfilePhotoUpload from './ProfilePhotoUpload';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, logout, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchProfileData();
    }
  }, [isOpen, user]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/users/profile/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setCurrentPhoto(data.photoUrl || null);
        // Initialize edit form with current data
        setEditForm({
          name: data.name || user?.name || '',
          email: data.email || user?.email || '',
          phone: data.phone || ''
        });
      } else {
        // Fallback to context data if API fails
        setProfileData({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          batch: user.batch,
          joinDate: 'Not available',
          lastLogin: 'Not available',
          status: 'Active'
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Fallback to context data
      const fallbackData = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        batch: user.batch,
        joinDate: 'Not available',
        lastLogin: 'Not available',
        status: 'Active'
      };
      setProfileData(fallbackData);
      // Initialize edit form with fallback data
      setEditForm({
        name: fallbackData.name || '',
        email: fallbackData.email || '',
        phone: fallbackData.phone || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdated = (photoUrl) => {
    setCurrentPhoto(photoUrl);
    // Also update profile data to reflect the change
    setProfileData(prev => ({
      ...prev,
      photoUrl: photoUrl
    }));
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSaveMessage('');
    if (!isEditing) {
      // Reset form to current data when starting edit
      setEditForm({
        name: profileData?.name || user?.name || '',
        email: profileData?.email || user?.email || '',
        phone: profileData?.phone || ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!editForm.name.trim()) {
      setSaveMessage('Name is required');
      return false;
    }
    if (!editForm.email.trim()) {
      setSaveMessage('Email is required');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setSaveMessage('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage('');

    // Validate form data
    if (!validateForm()) {
      setSaving(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/users/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const result = await response.json();
        setSaveMessage('Profile updated successfully!');
        // Update local profile data
        setProfileData(prev => ({
          ...prev,
          ...editForm
        }));
        // Update auth context with new user data
        updateUser({
          name: editForm.name,
          email: editForm.email
        });
        
        setIsEditing(false);
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        try {
          const errorData = await response.json();
          setSaveMessage(errorData.error || errorData.details || 'Failed to update profile');
        } catch (parseError) {
          setSaveMessage(`Failed to update profile (Status: ${response.status})`);
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setSaveMessage('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-profile-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-profile-header">
          <div className="d-flex align-items-center">
            <div className="user-avatar-large bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3 overflow-hidden">
              {currentPhoto ? (
                <img 
                  src={currentPhoto} 
                  alt="Profile" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              ) : (
                <i className="fas fa-user fa-2x"></i>
              )}
            </div>
            <div>
              <h4 className="mb-1">{user?.name || 'User'}</h4>
              <p className="text-muted mb-0">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
              </p>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="user-profile-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="profile-sections">
              {/* Profile Photo Section */}
              <div className="profile-section">
                <ProfilePhotoUpload 
                  currentPhoto={currentPhoto} 
                  onPhotoUpdated={handlePhotoUpdated} 
                />
              </div>

              {/* Personal Information */}
              <div className="profile-section">
                <h6 className="section-title">
                  <i className="fas fa-user me-2"></i>
                  Personal Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="form-control form-control-sm"
                          placeholder="Enter full name"
                        />
                      ) : (
                        <p>{profileData?.name || user?.name || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Username</label>
                      <p className="text-muted">{profileData?.username || user?.username || 'Not provided'} <small>(Read-only)</small></p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="form-control form-control-sm"
                          placeholder="Enter email address"
                        />
                      ) : (
                        <p>{profileData?.email || user?.email || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleInputChange}
                          className="form-control form-control-sm"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p>{profileData?.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Role</label>
                      <p>
                        <span className={`badge bg-${user?.role === 'admin' ? 'danger' : user?.role === 'teacher' ? 'success' : 'primary'}`}>
                          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-specific Information */}
              {user?.role === 'student' && (
                <div className="profile-section">
                  <h6 className="section-title">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Academic Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-item">
                        <label>Student ID</label>
                        <p>{profileData?.studentId || profileData?.id || user?.id || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item">
                        <label>Batch</label>
                        <p>{profileData?.batch || user?.batch || 'Not assigned'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item">
                        <label>Department</label>
                        <p>{profileData?.department || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item">
                        <label>Section</label>
                        <p>{profileData?.section || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user?.role === 'teacher' && (
                <div className="profile-section">
                  <h6 className="section-title">
                    <i className="fas fa-chalkboard-teacher me-2"></i>
                    Teaching Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-item">
                        <label>Teacher ID</label>
                        <p>{profileData?.teacherId || profileData?.id || user?.id || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item">
                        <label>Department</label>
                        <p>{profileData?.department || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="info-item">
                        <label>Designation</label>
                        <p>{profileData?.designation || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="profile-section">
                  <h6 className="section-title">
                    <i className="fas fa-user-shield me-2"></i>
                    Administrative Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-item">
                        <label>Admin Level</label>
                        <p>{profileData?.adminLevel || 'System Administrator'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item">
                        <label>Permissions</label>
                        <p>{profileData?.permissions || 'Full Access'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="profile-section">
                <h6 className="section-title">
                  <i className="fas fa-info-circle me-2"></i>
                  System Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>User ID</label>
                      <p>{profileData?.id || user?.id || 'Not available'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Status</label>
                      <p>
                        <span className="badge bg-success">
                          {profileData?.status || 'Active'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Join Date</label>
                      <p>{profileData?.joinDate || 'Not available'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Last Login</label>
                      <p>{profileData?.lastLogin || 'Current session'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="user-profile-footer">
          {saveMessage && (
            <div className={`alert ${saveMessage.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-sm mb-3`}>
              <i className={`fas ${saveMessage.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
              {saveMessage}
            </div>
          )}
          <div className="d-flex justify-content-between">
            <div>
              {isEditing ? (
                <div className="btn-group">
                  <button 
                    className="btn btn-success"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handleEditToggle}
                    disabled={saving}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn btn-outline-primary" onClick={handleEditToggle}>
                  <i className="fas fa-edit me-2"></i>
                  Edit Profile
                </button>
              )}
            </div>
            <button className="btn btn-danger" onClick={handleLogout} disabled={saving}>
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .user-profile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
          padding: 20px;
        }

        .user-profile-modal {
          background: white;
          border-radius: 10px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .user-profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .user-avatar-large {
          width: 60px;
          height: 60px;
        }

        .user-profile-body {
          padding: 20px;
        }

        .profile-section {
          margin-bottom: 25px;
        }

        .section-title {
          color: #6c757d;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e9ecef;
          font-weight: 600;
        }

        .info-item {
          margin-bottom: 15px;
        }

        .info-item label {
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          margin-bottom: 5px;
          display: block;
        }

        .info-item p {
          margin: 0;
          font-size: 14px;
          color: #212529;
        }

        .info-item input {
          font-size: 14px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 6px 10px;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .info-item input:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: 0;
        }

        .alert-sm {
          padding: 8px 12px;
          font-size: 13px;
          border-radius: 4px;
        }

        .btn-group .btn {
          margin-right: 8px;
        }

        .btn-group .btn:last-child {
          margin-right: 0;
        }

        .user-profile-footer {
          padding: 20px;
          border-top: 1px solid #e9ecef;
          background-color: #f8f9fa;
        }

        @media (max-width: 768px) {
          .user-profile-modal {
            margin: 10px;
            max-height: 95vh;
          }
          
          .user-profile-header {
            padding: 15px;
          }
          
          .user-profile-body {
            padding: 15px;
          }
          
          .user-profile-footer {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;