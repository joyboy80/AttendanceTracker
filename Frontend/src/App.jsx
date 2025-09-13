import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Auth Components
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Dashboard Components
import StudentDashboard from './components/Dashboards/StudentDashboard';
import TeacherDashboard from './components/Dashboards/TeacherDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Route component based on user role
const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'STUDENT':
      return <StudentDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<DashboardRoute />} />
            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/*" 
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/unauthorized" element={
              <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                  <h2 className="text-danger">Unauthorized Access</h2>
                  <p>You don't have permission to access this page.</p>
                </div>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;