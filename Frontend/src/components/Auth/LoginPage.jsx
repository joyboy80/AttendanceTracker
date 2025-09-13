import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, isLoading } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="text-center mb-4">
          <i className="fas fa-graduation-cap fa-3x text-primary mb-3"></i>
          <h2 className="text-primary">University Attendance</h2>
          <p className="text-muted">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-4">
          <div className="text-center">
            <p className="mb-0">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary text-decoration-none">
                Sign up here
              </Link>
            </p>
          </div>
          
          <div className="mt-3">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Demo Accounts</h6>
                <small className="text-muted">
                  <strong>Student:</strong> student1 / password<br/>
                  <strong>Teacher:</strong> teacher1 / password<br/>
                  <strong>Admin:</strong> admin1 / password
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;