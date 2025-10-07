import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    // Student specific fields
    department: '',
    batch: '',
    section: '',
    // Teacher specific fields
    designation: '',
    // Admin specific fields
    adminSecret: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, isLoading } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.role === 'STUDENT' && (!formData.department || !formData.batch)) {
      setError('Please fill in department and batch for student registration');
      return false;
    }

    if (formData.role === 'TEACHER' && (!formData.department || !formData.designation)) {
      setError('Please fill in department and designation for teacher registration');
      return false;
    }

    if (formData.role === 'ADMIN') {
      if (!formData.adminSecret) {
        setError('Admin secret is required for admin registration');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Please sign in.');
        // Reset form
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          email: '',
          phone: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: 'STUDENT',
          department: '',
          batch: '',
          section: '',
          designation: '',
          adminSecret: ''
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="login-container">
      {/* Dark Mode Toggle */}
      <button 
        className="theme-toggle"
        onClick={toggleDarkMode}
        title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      >
        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>

      <div className="login-card" style={{ maxWidth: '600px' }}>
        <div className="text-center mb-4">
          <i className="fas fa-user-plus fa-3x text-primary mb-3"></i>
          <h2 className="text-primary">Create Account</h2>
          <p className="text-muted">Join the Smart Biometric Attendance Tracker</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label">Account Type *</label>
            <div className="row">
              <div className="col-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="student"
                    value="STUDENT"
                    checked={formData.role === 'STUDENT'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="student">
                    Student
                  </label>
                </div>
              </div>
              <div className="col-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="teacher"
                    value="TEACHER"
                    checked={formData.role === 'TEACHER'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="teacher">
                    Teacher
                  </label>
                </div>
              </div>
              <div className="col-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    id="admin"
                    value="ADMIN"
                    checked={formData.role === 'ADMIN'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="admin">
                    Admin
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="firstName" className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="middleName" className="form-label">Middle Name</label>
              <input
                type="text"
                className="form-control"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="lastName" className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="username" className="form-label">Username *</label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            {(formData.role === 'STUDENT' || formData.role === 'TEACHER') && (
              <div className="col-md-6 mb-3">
                <label htmlFor="department" className="form-label">Department *</label>
                <select
                  className="form-select"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CE">1. CE (Civil Engineering)</option>
                  <option value="EEE">2. EEE (Electrical and Electronic Engineering)</option>
                  <option value="ME">3. ME (Mechanical Engineering)</option>
                  <option value="CSE">4. CSE (Computer Science and Engineering)</option>
                  <option value="URP">5. URP (Urban and Regional Planning)</option>
                  <option value="ETE">6. ETE (Electronics and Telecommunication Engineering)</option>
                  <option value="MIE">7. MIE (Mechatronics and Industrial Engineering)</option>
                  <option value="MME">8. MME (Materials and Metallurgical Engineering)</option>
                  <option value="WRE">9. WRE (Water Resources Engineering)</option>
                  <option value="PME">10. PME (Petroleum and Mining Engineering)</option>
                  <option value="BME">11. BME (Biomedical Engineering)</option>
                  <option value="Archi">12. Archi (Architecture)</option>
                </select>
              </div>
            )}
          </div>

          {/* Student Specific Fields */}
          {formData.role === 'STUDENT' && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="batch" className="form-label">Batch *</label>
                <input
                  type="text"
                  className="form-control"
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="e.g., 2024"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="section" className="form-label">Section</label>
                <input
                  type="text"
                  className="form-control"
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g., A, B, C"
                />
              </div>
            </div>
          )}

          {/* Teacher Specific Fields */}
          {formData.role === 'TEACHER' && (
            <div className="mb-3">
              <label htmlFor="designation" className="form-label">Designation *</label>
              <select
                className="form-select"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              >
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Senior Lecturer">Senior Lecturer</option>
                <option value="Visiting Professor">Visiting Professor</option>
                <option value="Adjunct Professor">Adjunct Professor</option>
              </select>
            </div>
          )}

          {/* Admin Specific Fields */}
          {formData.role === 'ADMIN' && (
            <div className="mb-3">
              <label htmlFor="adminSecret" className="form-label">Admin Secret *</label>
              <input
                type="password"
                className="form-control"
                id="adminSecret"
                name="adminSecret"
                value={formData.adminSecret}
                onChange={handleChange}
                required
              />
              <div className="form-text">Enter the secret provided by your system administrator.</div>
            </div>
          )}

          {/* Password Fields */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="password" className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus me-2"></i>
                Create Account
              </>
            )}
          </button>

          <div className="text-center">
            <p className="mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-primary text-decoration-none">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
