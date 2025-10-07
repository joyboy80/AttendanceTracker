import React, { useState, useEffect } from 'react';
import StatsCard from '../Common/StatsCard';
import FingerprintRegistration from './FingerprintRegistration';
import { useAuth } from '../../contexts/AuthContext';

const StudentOverview = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    attendedClasses: 0,
    missedClasses: 0,
    attendanceRate: 0,
    studentName: '',
    batch: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('attendanceToken');
      const response = await fetch(`http://localhost:8080/api/users/student/dashboard/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.dashboard);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } else {
        setError('Failed to load dashboard');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button className="btn btn-outline-danger btn-sm ms-2" onClick={fetchDashboardData}>
            <i className="fas fa-redo me-1"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Total Classes"
            value={dashboardData.totalClasses.toString()}
            icon="fas fa-calendar"
            color="primary"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Attended"
            value={dashboardData.attendedClasses.toString()}
            icon="fas fa-check-circle"
            color="success"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Attendance Rate"
            value={`${dashboardData.attendanceRate}%`}
            icon="fas fa-percentage"
            color="info"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatsCard
            title="Missed Classes"
            value={dashboardData.missedClasses.toString()}
            icon="fas fa-times-circle"
            color="danger"
          />
        </div>
      </div>

      {/* Fingerprint Registration Section */}
      <div className="row mb-4">
        <div className="col-md-12">
          <FingerprintRegistration />
        </div>
      </div>

      {/* Student Information Card */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card bg-gradient-primary text-white">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h4 className="text-white mb-1">Welcome, {dashboardData.studentName || user?.name || 'Student'}!</h4>
                  <p className="mb-2 opacity-75">Batch: {dashboardData.batch || user?.batch || 'Not assigned'}</p>
                  <p className="mb-0 opacity-75">Keep up the great work with your attendance!</p>
                </div>
                <div className="col-md-4 text-end">
                  <i className="fas fa-user-graduate fa-4x opacity-75"></i>
                </div>
              </div>\n            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentOverview;