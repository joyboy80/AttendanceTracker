import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UserProfile from '../Common/UserProfile';

const Header = ({ toggleSidebar, title }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-white shadow-sm border-bottom py-3 px-4 header">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-primary d-md-none me-3"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </button>
          <h1 className="h4 mb-0 text-primary">{title}</h1>
        </div>

        <div className="d-flex align-items-center">
          {/* Dark Mode Toggle */}
          <button 
            className="dashboard-theme-toggle me-3"
            onClick={toggleDarkMode}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <div className="text-end me-3 d-none d-sm-block">
            <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
            <small style={{ color: 'var(--text-muted)' }}>
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
            </small>
          </div>
          <div 
            className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white user-profile-trigger"
            style={{ 
              width: '40px', 
              height: '40px', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.borderColor = '#0056b3';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '';
              e.target.style.borderColor = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}
            onClick={() => setShowProfile(true)}
            title="View Profile"
          >
            <i className="fas fa-user"></i>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </header>
  );
};

export default Header;