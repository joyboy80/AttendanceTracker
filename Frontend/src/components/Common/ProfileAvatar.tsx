import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  size = 'md', 
  className = '',
  showName = false 
}) => {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserPhoto();
    }
  }, [user?.id]);

  const fetchUserPhoto = async () => {
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/users/profile/${user?.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPhoto(data.photoUrl || null);
      }
    } catch (error) {
      console.error('Error fetching user photo:', error);
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return { width: '30px', height: '30px', fontSize: '12px' };
      case 'lg': return { width: '60px', height: '60px', fontSize: '20px' };
      default: return { width: '40px', height: '40px', fontSize: '16px' };
    }
  };

  const sizeStyles = getSizeClass();

  return (
    <div className={`d-flex align-items-center ${className}`}>
      <div 
        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white overflow-hidden"
        style={sizeStyles}
      >
        {photo ? (
          <img 
            src={photo} 
            alt="Profile" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        ) : (
          <i className="fas fa-user" style={{ fontSize: sizeStyles.fontSize }}></i>
        )}
      </div>
      {showName && (
        <span className="ms-2 text-white">{user?.name || 'User'}</span>
      )}
    </div>
  );
};

export default ProfileAvatar;