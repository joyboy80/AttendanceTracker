import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ toggleSidebar, title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-bottom py-3 px-4">
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
          <div className="text-end me-3 d-none d-sm-block">
            <div className="fw-semibold text-dark">{user?.name}</div>
            <small className="text-muted">
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
            </small>
          </div>
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
               style={{ width: '40px', height: '40px' }}>
            <i className="fas fa-user"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;