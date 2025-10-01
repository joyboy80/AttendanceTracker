import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getMenuItems = () => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { path: '/student', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
          { path: '/student/courses', icon: 'fas fa-graduation-cap', label: 'My Courses' },
          { path: '/student/schedule', icon: 'fas fa-calendar-week', label: 'My Schedule' },
          { path: '/student/attendance', icon: 'fas fa-check-circle', label: 'Give Attendance' },
          { path: '/student/statistics', icon: 'fas fa-chart-bar', label: 'Statistics' },
        ];
      case 'TEACHER':
        return [
          { path: '/teacher', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
          { path: '/teacher/schedule', icon: 'fas fa-calendar-week', label: 'My Schedule' },
          { path: '/teacher/activate', icon: 'fas fa-play-circle', label: 'Activate Attendance' },
          { path: '/teacher/courses', icon: 'fas fa-graduation-cap', label: 'My Assigned Courses' },
          { path: '/teacher/statistics', icon: 'fas fa-chart-line', label: 'Statistics' },
        ];
      case 'ADMIN':
        return [
          { path: '/admin', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
          { path: '/admin/users', icon: 'fas fa-users', label: 'User Management' },
          { path: '/admin/courses', icon: 'fas fa-book', label: 'Course Management' },
          { path: '/admin/routine', icon: 'fas fa-calendar-alt', label: 'Routine Management' },
          { path: '/admin/overview', icon: 'fas fa-chart-pie', label: 'Attendance Overview' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="d-md-none position-fixed w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar d-flex flex-column position-fixed position-md-relative h-100 ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-brand">
          <i className="fas fa-graduation-cap fa-2x mb-2"></i>
          <h4>Attendance</h4>
          <small className="text-light opacity-75">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal
          </small>
        </div>

        <nav className="nav flex-column flex-grow-1 py-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
              <i className={item.icon}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-3 border-top border-light border-opacity-25">
          <div className="text-center mb-3">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                 style={{ width: '50px', height: '50px' }}>
              <i className="fas fa-user text-primary"></i>
            </div>
            <div className="mt-2">
              <h6 className="mb-0 text-white">{user.name}</h6>
              <small className="text-light opacity-75">{user.email}</small>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-outline-light btn-sm w-100"
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;